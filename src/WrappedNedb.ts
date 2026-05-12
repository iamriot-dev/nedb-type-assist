import type { Document } from "@seald-io/nedb";
import type { Paths, SetOptional } from "type-fest";
import type {
	$ExcludeProjection,
	$IncludeProjection,
	$Projection,
} from "./$Projection";
import type { $Query } from "./$Query";
import type { $Update, UpdateOptions } from "./$Update";
import type { Cursor, CursorCount } from "./Cursor";
import type { Augment, GetEnforceCustomId } from "./Utils";
import type { WrapOptions } from "./WrapOptions";

export type WrappedNedb<
	T extends Record<string, unknown>,
	Options extends WrapOptions,
> = {
	readonly autoloadPromise: Promise<void>;

	setAutocompactionInterval(interval: number): void;
	stopAutocompaction(): void;
	compactDatafileAsync(): Promise<void>;
	loadDatabaseAsync(): Promise<void>;
	getAllData(): T[];

	ensureIndexAsync(options: {
		fieldName: keyof T | (keyof T)[];
		unique?: boolean;
		sparse?: boolean;
		expireAfterSeconds?: number;
	}): Promise<void>;
	removeIndexAsync(fieldName: keyof T | (keyof T)[]): Promise<void>;

	insertAsync(
		newDoc: GetEnforceCustomId<Options> extends true
			? T
			: SetOptional<T, "_id">,
	): Promise<Document<Augment<T, Options>> | undefined>;
	insertAsync(
		newDocs: (GetEnforceCustomId<Options> extends true
			? T
			: SetOptional<T, "_id">)[],
	): Promise<Document<Augment<T, Options>>[]>;

	countAsync(query: $Query<T, T>): CursorCount;

	findAsync(query: $Query<T, T>): Cursor<T, true, Options>;
	findAsync<
		P extends $ExcludeProjection<PU, KeepId> | $IncludeProjection<PU, KeepId>,
		PU extends Paths<T>,
		KeepId extends 0 | 1,
	>(
		query: $Query<T, T>,
		projection: P,
	): Cursor<$Projection<T, P, PU, KeepId>, true, Options>;

	findOneAsync(query: $Query<T, T>): Cursor<T, false, Options>;
	findOneAsync<
		P extends $ExcludeProjection<PU, KeepId> | $IncludeProjection<PU, KeepId>,
		PU extends Paths<T>,
		KeepId extends 0 | 1,
	>(
		query: $Query<T, T>,
		projection: P,
	): Cursor<$Projection<T, P, PU, KeepId>, false, Options>;

	updateAsync<
		O extends UpdateOptions,
		Q extends O["upsert"] extends true
			? GetEnforceCustomId<Options> extends true
				? Omit<$Query<T, T>, "_id"> & { _id: T["_id"] }
				: $Query<T, T>
			: $Query<T, T>,
	>(
		query: Q,
		updateQuery: $Update<Omit<T, "_id">, O["upsert"], Paths<Q>>,
		options?: O,
	): Promise<{
		numAffected: number;
		affectedDocuments: O["returnUpdatedDocs"] extends true
			? O["multi"] extends true
				? Document<Augment<T, Options>>[] | null
				: Document<Augment<T, Options>> | null
			: null;
		upsert: boolean;
	}>;

	removeAsync(
		query: $Query<T, T>,
		options: {
			multi?: boolean;
		},
	): Promise<number>;
};
