# Use an Expo dev client (prebuild) so Detox E2E runs locally

Detox cannot run against Expo Go — it needs a real native build. We therefore
use Expo's managed workflow with a **dev client**: `expo prebuild` generates the
`ios/` and `android/` projects and we build/run with `expo run:ios|android`.
This lets the required Detox flow (launch → search → open detail → interact with
the animated header) actually execute locally, which the assignment grades under
testing depth.

Trade-off: native `ios/`/`android` folders and CocoaPods enter the repo and the
first build is slower, versus staying on Expo Go (faster dev, but Detox could
only be documented, not run). We accept the heavier setup for a real, runnable
E2E suite.
