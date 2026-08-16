# Fitness Tracker Agent Instructions

## Validation

- For frontend changes, run the relevant checks from `app/`.
- Never start or run the development server. Use non-server checks such as the production build instead.
- When a change affects responsive layout, verify it at desktop and mobile widths.
- Preserve unrelated working-tree changes and exclude them from task-specific commits.

## Deployment

- The production checkout is `~/services/fitness-tracker` on `infiniter@nixpi.local`.
- The production host uses an ignored, host-local `docker-compose.yml`. Preserve it; do not replace it with the tracked Compose files.
- When the user says **"push and deploy"**, they authorize committing and pushing the scoped changes from the current workspace, followed by deploying them on the production host.
- Commit only files that belong to the requested change. Do not include unrelated existing modifications.
- Before deployment, run appropriate local validation and push the current branch to its configured upstream.
- Deploy over SSH with a fast-forward-only pull and rebuild the production Compose stack:

  ```sh
  ssh infiniter@nixpi.local
  cd ~/services/fitness-tracker
  git pull --ff-only
  docker compose up -d --build
  ```

- After deployment, verify the Compose services are running and report any build or health failures.
