# `Turborepo` Rsbuild starter

This is a community-maintained example. If you experience a problem, please submit a pull request with a fix. GitHub Issues will be closed.

## Using this example

Run the following command:

```sh
npx create-turbo@latest -e with-rsbuild
```

## K3s

K3s installs Traefik by default. The manifests in `infrastructure/k3s/apps`
use that Traefik ingress class and expose the service at
`http://service.akira.local` and the web app at `http://akira.local`.

Create or edit the ignored local secret at
`infrastructure/k3s/apps/secrets/stock-sync-secret.yaml` from the tracked
example.

Sync local application images into k3s before applying the manifests:

```sh
pnpm k3s:sync-local-images
```

This builds timestamped local image tags, imports them into k3s' containerd,
applies `infrastructure/k3s/apps`, and updates the running deployments to the
imported tags. It simulates pushing images to a registry without needing a local
registry.

Preview the commands without changing Docker or k3s with:

```sh
pnpm k3s:sync-local-images -- --dry-run
```

If those hostnames do not already resolve to your k3s node, add them to your
local DNS or `/etc/hosts`.

If `kubectl` cannot read `/etc/rancher/k3s/k3s.yaml`, install the k3s server
config and restart k3s so it writes a user-readable kubeconfig:

```sh
sudo install -m 0644 infrastructure/k3s/cluster/config.yaml /etc/rancher/k3s/config.yaml
sudo systemctl restart k3s
```

## What's inside?

This Turborepo includes the following packages and apps:

### Apps and Packages

- `web`: React [Rsbuild](https://rsbuild.rs) TypeScript app
- `@repo/ui`: a stub component library shared by `web` application
- `@repo/rslint-config`: `rslint` configurations used throughout the monorepo
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package and app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Rslint](https://rslint.rs/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Rsbuild](https://rsbuild.rs/) for local development and production builds
