#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../../.." && pwd)"

DOCKER="${DOCKER:-docker}"
KUBECTL="${KUBECTL:-kubectl}"
K3S_CTR="${K3S_CTR:-sudo k3s ctr}"
KUSTOMIZE_DIR="${KUSTOMIZE_DIR:-infrastructure/k3s/apps}"
NAMESPACE="${KUBE_NAMESPACE:-stock-sync}"
TAG="${IMAGE_TAG:-local-$(date +%Y%m%d%H%M%S)}"
DRY_RUN=0
WAIT_ROLLOUT=1

usage() {
  cat <<'EOF'
Usage: pnpm k3s:sync-local-images [--dry-run] [--tag <tag>] [--namespace <namespace>] [--no-rollout-wait]

Builds local Docker images, imports them into k3s' containerd image store,
applies the k3s manifests, and updates the live deployments to the imported tag.

Environment overrides:
  DOCKER         Docker command. Default: docker
  KUBECTL        kubectl command. Default: kubectl
  K3S_CTR        k3s ctr command. Default: sudo k3s ctr
  IMAGE_TAG      Image tag. Default: local-YYYYmmddHHMMSS
  KUBE_NAMESPACE Kubernetes namespace. Default: stock-sync
  KUSTOMIZE_DIR  Kustomize directory. Default: infrastructure/k3s/apps
EOF
}

while (($#)); do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --tag)
      TAG="${2:?Missing value for --tag}"
      shift 2
      ;;
    --namespace)
      NAMESPACE="${2:?Missing value for --namespace}"
      shift 2
      ;;
    --no-rollout-wait)
      WAIT_ROLLOUT=0
      shift
      ;;
    --)
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown option: %s\n\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

read -r -a K3S_CTR_COMMAND <<<"${K3S_CTR}"

quote_args() {
  printf '%q ' "$@"
}

run() {
  if ((DRY_RUN)); then
    printf '+ '
    quote_args "$@"
    printf '\n'
    return 0
  fi

  "$@"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

import_images() {
  if ((DRY_RUN)); then
    printf '+ '
    quote_args "${DOCKER}" save "$@"
    printf '| '
    quote_args "${K3S_CTR_COMMAND[@]}" images import -
    printf '\n'
    return 0
  fi

  "${DOCKER}" save "$@" | "${K3S_CTR_COMMAND[@]}" images import -
}

if ((!DRY_RUN)); then
  require_command "${DOCKER}"
  require_command "${KUBECTL}"
  require_command "${K3S_CTR_COMMAND[0]}"
fi

cd "${REPO_ROOT}"

images=(
  'stock-sync-web|apps/web/Dockerfile|deployment/stock-sync-web|stock-sync-web'
  'stock-sync-service|apps/service/Dockerfile|deployment/stock-sync-service|stock-sync-service'
)

images_to_import=()

printf 'Using local image tag: %s\n' "${TAG}"

for image_config in "${images[@]}"; do
  IFS='|' read -r image dockerfile _deployment _container <<<"${image_config}"
  run "${DOCKER}" build -t "${image}:${TAG}" -t "${image}:latest" -f "${dockerfile}" .
  images_to_import+=("${image}:${TAG}" "${image}:latest")
done

import_images "${images_to_import[@]}"

run "${KUBECTL}" apply -k "${KUSTOMIZE_DIR}"

for image_config in "${images[@]}"; do
  IFS='|' read -r image _dockerfile deployment container <<<"${image_config}"
  run "${KUBECTL}" -n "${NAMESPACE}" set image "${deployment}" "${container}=${image}:${TAG}"
done

if ((WAIT_ROLLOUT)); then
  for image_config in "${images[@]}"; do
    IFS='|' read -r _image _dockerfile deployment _container <<<"${image_config}"
    run "${KUBECTL}" -n "${NAMESPACE}" rollout status "${deployment}"
  done
fi
