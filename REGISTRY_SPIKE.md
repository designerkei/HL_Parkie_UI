# Parkie UI registry installation spike

## Purpose

This gate proves that an immutable private package can be published and then
installed by a clean consumer. The smoke package deliberately contains no
design-system CSS or React components, so registry failures stay separate from
library implementation failures.

## Package contract

- Package: `@designerkei/parkie-ui`
- Registry candidate: GitHub Packages
- Smoke versions: `0.0.0-registry-smoke.<run-number>`
- Product versions start at `0.1.0`
- Node used for publication: 20

## Local checks

```powershell
npm ci
npm run publish:parkie-ui:dry-run
npm run pack:parkie-ui
```

Install the generated tarball in a disposable directory and verify both ESM
and CommonJS imports. Never add a local tarball to the RMS lockfile.

Verified on 2026-09-04 with Node 24.11.0 and npm 11.6.1:

- publish dry-run succeeded with the `registry-smoke` dist-tag
- tarball contained exactly five files and was 873 bytes
- installation in a clean temporary consumer succeeded
- ESM import succeeded
- CommonJS require succeeded

## Remote check

Push `feat/parkie-ui-foundation-v0.1` or manually run **Parkie UI registry
smoke** in GitHub Actions. The workflow publishes a unique pre-release version
with `GITHUB_TOKEN`, creates a clean consumer directory, installs that exact
version from GitHub Packages, and imports it.

The workflow must finish successfully before design tokens or components are
added to the package.

GitHub Actions run `33831584586` completed successfully on 2026-09-04. It
published `0.0.0-registry-smoke.1` and installed that exact version in a clean
consumer using the repository-scoped `GITHUB_TOKEN`.

The current development machine has no GitHub Packages npm credential and no
Docker executable. Remote publication is therefore delegated to the scoped
GitHub Actions token, while the production Docker check remains an explicit
internal-CI gate.

## RMS and internal CI gate

The successful GitHub Actions run proves the GitHub registry path, but not the
HL Robotics production path. The RMS build environment must separately prove:

1. `npm ci` can reach `npm.pkg.github.com`.
2. A read-only package token is supplied as a build secret.
3. The token never appears in an image layer, build log, `.npmrc`, or lockfile.
4. The existing Node 20 production build succeeds with the package installed.

The workflow also checks out the current RMS feature branch into a disposable
directory, adds the exact smoke version to its temporary lockfile, and performs
the RMS build in a Node 20 Docker stage. Registry credentials are mounted with a
BuildKit secret and never copied into an image layer.

If the internal environment cannot satisfy those conditions, publish the same
package artifact to the internal GitLab npm registry instead. Do not fall back
to a Git SSH dependency for production builds.
