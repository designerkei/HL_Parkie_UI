# Parkie UI registry installation spike

## Purpose

This gate proves that an immutable private package can be published and then
installed by a clean consumer. The initial smoke package contained no
design-system CSS or React components so registry failures stayed separate from
library implementation failures. After the gate passed, `@designerkei/parkie-ui`
became the canonical package for Parkie tokens and primitives.

## Package contract

- Package: `@designerkei/parkie-ui`
- Registry candidate: GitHub Packages
- Smoke versions: `0.0.0-registry-smoke.<run-number>`
- Product versions start at `0.1.0`
- Node used for publication: 20
- CSS entrypoints:
  - `@designerkei/parkie-ui/tokens.css`
  - `@designerkei/parkie-ui/styles.css`
  - `@designerkei/parkie-ui/components.css`
  - `@designerkei/parkie-ui/legacy-rms.css`
- JS entrypoints:
  - `@designerkei/parkie-ui`
  - `@designerkei/parkie-ui/react`
  - `@designerkei/parkie-ui/antd`

## Local checks

```powershell
npm ci
npm run publish:parkie-ui:dry-run
npm run pack:parkie-ui
```

Install the generated tarball in a disposable directory and verify both ESM
and CommonJS imports. Never add a local tarball to the RMS lockfile.

Verified the registry-only package on 2026-09-04 with Node 24.11.0 and npm 11.6.1:

- publish dry-run succeeded with the `registry-smoke` dist-tag
- tarball contained exactly five files and was 873 bytes
- installation in a clean temporary consumer succeeded
- ESM import succeeded
- CommonJS require succeeded

Verified the first package-library shape on 2026-09-04:

- `@designerkei/parkie-ui@0.1.0` packed with token CSS, product CSS, legacy RMS
  aliases, root token helpers, React primitives, and an AntD theme adapter
- tarball contained 14 files and no guide-only documentation CSS
- installation in a clean temporary consumer succeeded
- ESM imports succeeded for root, `/antd`, and `/react`
- CommonJS requires succeeded for root, `/antd`, and `/react`
- package CSS files existed under `node_modules/@designerkei/parkie-ui`

## Remote check

The **Parkie UI registry smoke** workflow publishes a unique pre-release version
with `GITHUB_TOKEN`, creates a clean consumer directory, installs that exact
version from GitHub Packages, and imports it. Feature-branch pushes currently
run the RMS Docker consumer gate automatically so the private consumer path does
not depend on the GitHub UI's manual workflow button.

GitHub Actions run `33831584586` completed successfully on 2026-09-04. It
published `0.0.0-registry-smoke.1` and installed that exact version in a clean
consumer using the repository-scoped `GITHUB_TOKEN`.

GitHub Actions run `33838565584` completed successfully on 2026-09-04 after the
`RMS_REPO_TOKEN` secret was added. It published `0.0.0-registry-smoke.5`,
installed it in a clean consumer, checked out private `designerkei/Parkie-RMS`,
pinned the package in a disposable RMS lockfile, and completed the Node 20 Docker
build using a BuildKit-mounted npm credential.

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

The optional `run_rms_docker` input also checks out the current RMS feature
branch into a disposable directory, adds the exact smoke version to its
temporary lockfile, and performs the RMS build in a Node 20 Docker stage.
Registry credentials are mounted with a BuildKit secret and never copied into
an image layer.

Because `Parkie-RMS` is private, that option requires a repository Actions
secret named `RMS_REPO_TOKEN`. Use a fine-grained token restricted to
`designerkei/Parkie-RMS` with read-only Contents permission. Runs 2 and 3 proved
that the registry publication and clean installation still pass, but correctly
failed at cross-repository checkout when that permission was absent. Run 5
proved that the configured token can read RMS and build it.

If the internal environment cannot satisfy those conditions, publish the same
package artifact to the internal GitLab npm registry instead. Do not fall back
to a Git SSH dependency for production builds.
