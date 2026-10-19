# MM2 Trade Check

Static site + automatic updater, free on GitHub. Values come from the RBLXValue API
(a blend of MM2Values and Supreme Values, refreshed every 12 hours).

## Setup
1. Get a free API key: https://rblxvalue.com/developer (log in with Roblox).
2. Create a GitHub repo and upload everything in this folder (keep the .github folder).
3. Repo Settings > Secrets and variables > Actions > New secret: name `RBLX_API_KEY`, value = your key.
4. Repo Settings > Pages > deploy from the main branch (root). Your site goes live.
5. Actions tab > "Update values" > Run workflow. It then runs every 6 hours by itself.

## Rules to follow
- Free keys must show "Data from rblxvalue.com". The site already does this in the footer.
- Never put your API key in index.html. It only lives in the GitHub secret.
- Free limit is 30 requests/minute; the updater uses about 8 per run.

Test locally: `RBLX_API_KEY=xxx node scripts/update-values.mjs`, then `python3 -m http.server` and open http://localhost:8000
