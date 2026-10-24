# Third-party notices

Original PMCAS code and documentation are MIT licensed by Maged Taha. Upstream software keeps its own license; the project license does not relicense it.

## Source included here

The seven primitives in `components/ui/` follow shadcn/ui patterns. The recovered archive does not establish an exact upstream revision. The shadcn MIT attribution is retained in [LICENSES/shadcn-MIT.txt](LICENSES/shadcn-MIT.txt), using the upstream notice published at https://github.com/shadcn-ui/ui/blob/main/LICENSE.md (reviewed 24 October 2026). Keep this attribution with those primitives.

No third-party fonts, photos or client assets are included in this source candidate. The seed brand is fictional.

## Dependencies

[The inventory](docs/DEPENDENCY_LICENSES.json) records exact lockfile packages and license metadata available on the review machine. Root license/notice files for installed direct dependencies and selected attribution/copyleft dependencies are preserved under [LICENSES/dependencies](LICENSES/dependencies). It is an inventory, not a promise that every optional platform package has been inspected.

- Prisma and TypeScript declare Apache-2.0. Preserve applicable upstream notices when distributing their code or compiled work.
- React, Next.js and most tooling declare MIT, ISC or BSD-family terms. Some Next.js tooling packages omit a root notice; the Next.js package's upstream MIT notice is preserved here.
- seq-queue's original package LICENSE established MIT despite missing metadata. It is not present in the current updated lockfile.
- Optional sharp/libvips platform packages can carry LGPL-related terms; axe-core declares MPL-2.0, and caniuse-lite declares CC-BY-4.0. Review the actual artifacts, attribution and source/relinking obligations before distributing bundled dependencies, containers or binaries. These dependencies do not become MIT merely by being installed alongside PMCAS.

The publication source contains no node_modules, dependency binaries, database, build output or vendored package implementation. Users install the packages identified by pnpm-lock.yaml. Optional packages not installed on the review platform are marked unverified. If a dependency's ownership or terms cannot be established for a future distribution, resolve that before including it.

Unused experimental WASM/compiler and cross-env direct dependencies were removed. No known vulnerability advisories were reported by the final registry audit on 24 October 2026; this is time-limited advisory coverage, not a security guarantee.
