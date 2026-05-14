import type { Document } from "@seald-io/nedb";
import type { MergeDeep, Paths, SetOptional } from "type-fest";
import type { $AnyProjection, $Projection } from "./$Projection";
import type {
	$ProjectionTransform,
	FilteredKeys,
} from "./$ProjectionTransform";
import type { $Query } from "./$Query";
import type { $Update, UpdateOptions } from "./$Update";
import type { $addToSetOp, $incOp, $maxOp, $minOp, $pushOp } from "./$Upsert";
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
	findAsync<P extends $AnyProjection<PU>, PU extends Paths<T>>(
		query: $Query<T, T>,
		projection: P,
	): Cursor<
		MergeDeep<
			$Projection<T, P, PU>,
			// biome-ignore lint/complexity/noBannedTypes: This is an accumulator
			$ProjectionTransform<FilteredKeys<T, P>, T, {}>
		>,
		true,
		Options,
		T
	>;

	findOneAsync(query: $Query<T, T>): Cursor<T, false, Options>;
	findOneAsync<P extends $AnyProjection<PU>, PU extends Paths<T>>(
		query: $Query<T, T>,
		projection: P,
	): Cursor<
		MergeDeep<
			$Projection<T, P, PU>,
			// biome-ignore lint/complexity/noBannedTypes: This is an accumulator
			$ProjectionTransform<FilteredKeys<T, P>, T, {}>
		>,
		false,
		Options,
		T
	>;

	updateAsync<
		O extends UpdateOptions,
		Q extends QueryForUpdate<T, Options, O>,
		Push extends $pushOp<Omit<T, "_id">>,
		AddToSet extends $addToSetOp<Omit<T, "_id">>,
		Inc extends $incOp<Omit<T, "_id">>,
		Min extends $minOp<Omit<T, "_id">>,
		Max extends $maxOp<Omit<T, "_id">>,
	>(
		query: Q,
		updateQuery: $Update<
			Omit<T, "_id">,
			O["upsert"],
			Paths<Q>,
			Push,
			AddToSet,
			Inc,
			Min,
			Max
		>,
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

type QueryForUpdate<
	T extends Record<string, unknown>,
	Options extends WrapOptions,
	O extends UpdateOptions,
> = O["upsert"] extends true
	? GetEnforceCustomId<Options> extends true
		? Omit<$Query<T, T>, "_id"> & {
				_id: T["_id"];
			}
		: $Query<T, T>
	: $Query<T, T>;
