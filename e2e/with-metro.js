#!/usr/bin/env node
/**
 * Boots Metro (`expo start --dev-client`), waits until it is serving, runs the
 * command passed as arguments, then shuts Metro down — so a debug Detox run has
 * a bundler to load JS from. Used by the `e2e:ios:debug` / `e2e:android:debug`
 * scripts. Usage: `node e2e/with-metro.js <command> [args...]`.
 */
const { spawn } = require('child_process');
const http = require('http');

const cmd = process.argv.slice(2);
if (cmd.length === 0) {
  console.error('Usage: node e2e/with-metro.js <command> [args...]');
  process.exit(1);
}

const STATUS_URL = 'http://localhost:8081/status';
const READY_TIMEOUT_MS = 90_000;

function metroIsUp() {
  return new Promise((resolve) => {
    const req = http.get(STATUS_URL, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve(body.includes('packager-status:running')));
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForMetro() {
  const start = Date.now();
  while (Date.now() - start < READY_TIMEOUT_MS) {
    if (await metroIsUp()) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function main() {
  console.log('[with-metro] starting Metro (expo start --dev-client)…');
  // detached so the whole process group can be killed cleanly at the end.
  const metro = spawn('npx', ['expo', 'start', '--dev-client'], {
    stdio: 'inherit',
    detached: true,
    env: process.env,
  });

  let shuttingDown = false;
  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    try {
      process.kill(-metro.pid, 'SIGTERM');
    } catch {
      /* already gone */
    }
  };
  process.on('exit', shutdown);
  process.on('SIGINT', () => {
    shutdown();
    process.exit(130);
  });

  if (!(await waitForMetro())) {
    console.error('[with-metro] Metro did not become ready in time.');
    shutdown();
    process.exit(1);
  }

  console.log(`[with-metro] Metro is up — running: ${cmd.join(' ')}`);
  const child = spawn(cmd[0], cmd.slice(1), { stdio: 'inherit', env: process.env });
  child.on('exit', (code) => {
    shutdown();
    process.exit(code ?? 1);
  });
}

main();
