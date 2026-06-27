# Issue tracker

This repo does **not** use an issue tracker.

Skills that create or read issues (`triage`, `to-issues`, `to-prd`)
should not run `gh`/`glab`, should not write `.scratch/` issue files, and
should not assume any external tracker. If such a skill is invoked, it should
tell the user that no tracker is configured and stop, rather than inventing one.
