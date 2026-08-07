# Copacetic

This repository contains the source and the built static site for COPACETIC.

Site status
- The built site has been copied into the `docs/` folder on `main` so GitHub Pages can serve it.
- I added an automated Pages deployment workflow so the site is published whenever `docs/` is updated.

Live site
- The Pages site will be (or is) available at: https://richsteve17.github.io/Copacetic/
- Publication may take a minute after the workflow runs.

How it works
- A GitHub Actions workflow (.github/workflows/pages-deploy.yml) uploads the contents of `docs/` and deploys to GitHub Pages using the official `actions/upload-pages-artifact` and `actions/deploy-pages` actions.
- To update the site, push changes to `docs/` on `main` (or update source and push). The workflow will redeploy automatically.

If you want me to remove the `extracted_files/` artifacts or move the source into a different branch, tell me and I will prepare a PR.
