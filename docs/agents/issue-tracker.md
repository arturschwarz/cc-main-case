# Issue tracker

This repo does **not** use an issue tracker.

Skills that create or read issues (`triage`, `to-issues`, `qa`, `to-prd`)
should not run `gh`/`glab`, should not write `.scratch/` issue files, and
should not assume any external tracker. If such a skill is invoked, it should
tell the user that no tracker is configured and stop, rather than inventing one.

To enable a tracker later (e.g. after pushing to GitHub), re-run
`/setup-matt-pocock-skills` and choose GitHub, GitLab, or local markdown.
