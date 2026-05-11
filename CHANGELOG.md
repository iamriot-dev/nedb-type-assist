# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-05-11

### Fixed

- Improved upsert type safety. You can now use upsert with custom IDs. Upsert now requires `_id` in the query, and still requires a complete document in `$set`.
- Fixed the `insertAsync()` type to allow custom IDs, even if `useCustomId` is set to `false`.

### Changed

- Renamed `useCustomId` to `enforceCustomId` to avoid confusion.
  - `useCustomId` is now deprecated. It will be removed in a future release.

## [0.1.2] - 2026-05-11

### Fixed

- Added the missing `$inc` operator to `updateAsync()` types.

## [0.1.1] - 2026-05-11

### Fixed

- When using `updateAsync()` with `returnUpdatedDocs: true`, the return type now correctly includes the updated documents.

### Changed

- All types of `never` in return types are now mapped to `unknown`. There is no runtime effect. If you were using `never` in your data types, they will also be affected. It is recommended to avoid `never` in your data types.

## [0.1.0] - 2026-05-11

### Added

- Changelog is now available, and you're reading it right now!
- Projection type safety is here! When you use projections, the return type will now reflect the projected fields.

### Changed

- `_id` on schema is now required.
  - It was recommended to begin with, but it is now required as projection types relies on it. If you leave it out, typescript will remind you to add it.

## [0.0.2] - 2026-05-10

No functionality changes.

### Added

- Added `LICENSE.md` file with MIT License.
- Added `keywords` to `package.json`.

### Changed

- Updated `description` in `package.json`.

## [0.0.1] - 2026-05-10

Initial release.
