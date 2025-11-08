#!/usr/bin/env bash
set -euo pipefail

# Load .env into env vars (if present)
if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

DEFAULT_COMMIT_MESSAGE=${1:-"deploy: content update"}

step() {
  printf "\n%s\n" "$1"
}

step "🔧 1–2. Синхронизирую updatedAt и кеш…"
npm run sync:updated-at
npm run cache:build

if git diff --quiet && git diff --cached --quiet; then
  echo "⚠️  Нет изменений для коммита. Пропускаю commit/push."
else
  step "📦 3. Добавляю файлы в Git…"
  git add -A

  step "📦 4. Делаю коммит…"
  git commit -m "$DEFAULT_COMMIT_MESSAGE" --no-verify
  COMMIT_TIME=$(git log -1 --format=%cI HEAD)

  step "🔁 4а. Уточняю updatedAt с учётом нового коммита…"
  npm run sync:updated-at
  if ! git diff --quiet; then
    npm run cache:build
    git add -A
    GIT_AUTHOR_DATE="$COMMIT_TIME" GIT_COMMITTER_DATE="$COMMIT_TIME" git commit --amend --no-edit --no-verify
  fi
fi

step "🏗️ 5. Собираю проект…"
npm run build

read -r -p "🔍 6. Обновить поиск Algolia? (y/N) " run_algolia
if [[ "${run_algolia,,}" == "y" ]]; then
  if [[ -z "${ALGOLIA_ADMIN_API_KEY:-}" ]]; then
    read -r -s -p "Введите ALGOLIA_ADMIN_API_KEY: " ALGOLIA_ADMIN_API_KEY
    echo
  fi
  export ALGOLIA_ADMIN_API_KEY
  npm run algolia:sync
fi

read -r -p "🚀 7. Выполнить git push origin main? (y/N) " run_push
if [[ "${run_push,,}" == "y" ]]; then
  git push -u origin main
  echo "✅ Готово!"
else
  echo "ℹ️  Пропустил push. Не забудь выполнить его вручную."
fi
