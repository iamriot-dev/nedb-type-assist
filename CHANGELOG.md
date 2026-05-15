# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-05-15

### Fixed

- Improved accuracy of projected types.
- Projections no longer allow mixing `0` and `1`, aligning with NeDB's API.

### Changed

- `_id` can no longer be set in projections.
  - To exclude `_id` from a projection, wrap your projection with `withoutId()`. This is a simple function that add `_id: 0` to your projection, and sets the correct return type.

## [0.3.0] - 2026-05-13

### Added

- Projections type overhaul:
  - Full type safe for projections. The type assistant now reflects the remapping of projected fields that can happen.
  - Remapped fields will be deeply optional for safety, as certain fields may not be present in some documents.

## [0.2.4] - 2026-05-12

### Fixed

- Improved projection type safety.
  - When chaining projections:
    - NeDB will only take into account the last projection. The types now reflect this.
    - All properties from the initial type are now available, following NeDB behaviour.

## [0.2.3] - 2026-05-12

### Fixed

- Upsert is now able to narrow down required fields in `$set` when using `updateAsync()`. Values that have been provided in the query as well as the `$inc`, `$min`, `$max`, `$push`, and `$addToSet` operators are no longer required.

## [0.2.2] - 2026-05-12

### Fixed

- Removed `_id` in `$set` when using `updateAsync()`, as it is not allowed in NeDB.
- Allow querying without `_id` for upserts when `enforceCustomId` is set to `false`, to more closely follow NeDB's API.

## [0.2.1] - 2026-05-12

### Added

- Added `withTimestampData` option to `wrapNedbWithConfig()`. This option adds `createdAt` and `updatedAt` properties to the types when returning documents. You do not need to add `createdAt` and `updatedAt` to your data types.
- Added `stopAutocompaction()`, `loadDatabaseAsync()`, and `getAllData()` methods to the wrapped NeDB instance.
- Added `autoloadPromise` propertyto the wrapped NeDB instance.

### Fixed

- Fixed the types for `$pop` and `$inc` operators.
- Fixed `updateAsync()` operators to be more strict when using upsert.

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
