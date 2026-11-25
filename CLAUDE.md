# Instructions for Claude Code

## Commits

- Commit as the repository owner, never as Claude: author and committer must be
  `Sharif H. Adal <sharifadal2008@gmail.com>` (the email linked to the GitHub
  account, so commits count as contributions).
- If `git config user.email` shows anything else (for example `noreply@anthropic.com`),
  run `git config user.name "Sharif H. Adal"` and
  `git config user.email "sharifadal2008@gmail.com"` before committing.
- Never set `--author` to Claude. A `Co-Authored-By: Claude ...` trailer at the end of
  the message is fine.

## This repo

- `README.md` is the GitHub profile page. The cards in `assets/` are drawn by
  `scripts/generate.mjs` (`npm ci && node scripts/generate.mjs`); edit the content
  constants at the top of that script, not the SVGs.
- The block between `<!-- years:start -->` and `<!-- years:end -->` in `README.md` is
  generated; don't edit it by hand.
- `.github/workflows/profile-cards.yml` refreshes the numbers every night.
