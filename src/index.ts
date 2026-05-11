import type Nedb from "@seald-io/nedb";
import type { Document } from "@seald-io/nedb";
import type {
	Get,
	IsOptional,
	NonNullableDeep,
	OmitDeep,
	Paths,
	PickDeep,
	RequireAtLeastOne,
	SetOptional,
} from "type-fest";

type $Query<
	T extends Record<string, unknown>,
	B extends Record<string, unknown>,
> = {
	[Key in Paths<T, { leavesOnly: false }>]?: NonNullable<
		Get<T, Key>
	> extends Array<infer A>
		? $ArrayOp<A, B> | A[]
		: NonNullable<Get<T, Key>> extends Record<string, unknown>
			?
					| $Query<NonNullable<Get<T, Key>>, B>
					| $Op<NonNullable<Get<T, Key>>>
					| Partial<Get<T, Key>>
			: Get<T, Key> | $Op<Get<T, Key>>;
} & $QueryGroups<T, B>;

type $QueryGroups<
	T extends Record<string, unknown>,
	B extends Record<string, unknown>,
> = {
	$or?: $Query<T, B>[];
	$and?: $Query<T, B>[];
	$not?: $Query<T, B>;
	$where?: (this: B) => boolean;
};

type $Op<V> = V extends number | string | Date
	? RequireAtLeastOne<$CompareOp<V> & $BaseOp<V>>
	: RequireAtLeastOne<$BaseOp<V>>;

type $CompareOp<V extends number | string | Date> = {
	$lt?: V;
	$lte?: V;
	$gt?: V;
	$gte?: V;
};

type $BaseOp<V> = {
	$in?: V[];
	$ne?: V;
	$nin?: V[];
	$exists?: boolean;
	$regex?: RegExp;
};

type $ArrayOp<A, B extends Record<string, unknown>> = RequireAtLeastOne<{
	$elemMatch?: A extends Record<string, unknown>
		? $Query<A, B> | $Op<A> | Partial<A>
		: A extends Array<infer AA>
			? $ArrayOp<AA, B>
			: $Op<A> | A;
	$size?: number;
}>;

type $ExcludeProjection<PU extends string, KeepId extends 0 | 1> = {
	[Key in PU]?: Key extends "_id" ? KeepId : 0;
};

type $IncludeProjection<PU extends string, KeepId extends 0 | 1> = {
	[Key in PU]?: Key extends "_id" ? KeepId : 1;
};

type $Update<
	T extends Record<string, unknown>,
	Upsert extends boolean | undefined,
> = RequireAtLeastOne<
	(Upsert extends true
		? { $set: Omit<T, "_id"> }
		: { $set?: { [Key in Paths<T>]?: NonNullableDeep<Get<T, Key>> } }) & {
		$unset?: {
			[Key in Paths<T> as IsOptional<Get<T, Key>> extends true
				? Key
				: never]?: true;
		};
		$push?: {
			[Key in Paths<T> as NonNullable<Get<T, Key>> extends Array<infer _>
				? Key
				: never]?: NonNullable<Get<T, Key>> extends Array<infer A>
				? A | RequireAtLeastOne<{ $each?: A[]; $slice?: number }>
				: never;
		};
		$pull?: {
			[Key in Paths<T> as NonNullable<Get<T, Key>> extends Array<infer _>
				? Key
				: never]?: NonNullable<Get<T, Key>> extends Array<infer A>
				? (Pick<$ArrayOp<A, never>, "$elemMatch"> | { $in: A[] }) | A
				: never;
		};
		$pop?: 1 | -1;
		$addToSet?: {
			[Key in Paths<T> as NonNullable<Get<T, Key>> extends Array<infer _>
				? Key
				: never]?: NonNullable<Get<T, Key>> extends Array<infer A>
				? A | RequireAtLeastOne<{ $each?: A[]; $slice?: number }>
				: never;
		};
		$inc?: {
			[Key in Paths<T> as NonNullable<Get<T, Key>> extends string
				? Key
				: never]?: NonNullable<Get<T, Key>>;
		};
		$min?: {
			[Key in Paths<T> as NonNullable<Get<T, Key>> extends
				| string
				| number
				| Date
				? Key
				: never]?: NonNullable<Get<T, Key>>;
		};
		$max?: {
			[Key in Paths<T> as NonNullable<Get<T, Key>> extends
				| string
				| number
				| Date
				? Key
				: never]?: NonNullable<Get<T, Key>>;
		};
	}
>;

type WrapOptions = {
	returnUntyped?: boolean;
	useCustomId?: boolean;
};

type WrappedNedb<
	T extends Record<string, unknown>,
	Options extends WrapOptions,
> = {
	setAutocompactionInterval(interval: number): void;
	compactDatafileAsync(): Promise<void>;
	ensureIndexAsync(options: {
		fieldName: keyof T | (keyof T)[];
		unique?: boolean;
		sparse?: boolean;
		expireAfterSeconds?: number;
	}): Promise<void>;
	removeIndexAsync(fieldName: keyof T | (keyof T)[]): Promise<void>;

	insertAsync(
		newDoc: Options["useCustomId"] extends true ? T : SetOptional<T, "_id">,
	): Promise<Document<Untype<T, Options>> | undefined>;
	insertAsync(
		newDocs: (Options["useCustomId"] extends true
			? T
			: SetOptional<T, "_id">)[],
	): Promise<Document<Untype<T, Options>>[]>;

	countAsync(query: $Query<T, T>): CursorCount;

	findAsync(query: $Query<T, T>): Cursor<T, true, Options>;
	findAsync<
		P extends $ExcludeProjection<PU, KeepId> | $IncludeProjection<PU, KeepId>,
		PU extends Paths<T>,
		KeepId extends 0 | 1,
	>(
		query: $Query<T, T>,
		projection: P,
	): Cursor<
		P extends $ExcludeProjection<PU, KeepId>
			? OmitDeep<
					T,
					// @ts-expect-error
					P["_id"] extends 0
						? // @ts-expect-error
							P["_id"] extends 1
							? never
							: keyof P | "_id"
						: Exclude<keyof P, "_id">
				>
			: PickDeep<
					T,
					// @ts-expect-error
					P["_id"] extends 0
						? // @ts-expect-error
							P["_id"] extends 1
							? never
							: Exclude<keyof P, "_id">
						: keyof P | "_id"
				>,
		true,
		Options
	>;

	findOneAsync(query: $Query<T, T>): Cursor<T, false, Options>;
	findOneAsync<
		P extends $ExcludeProjection<PU, KeepId> | $IncludeProjection<PU, KeepId>,
		PU extends Paths<T>,
		KeepId extends 0 | 1,
	>(
		query: $Query<T, T>,
		projection: P,
	): Cursor<
		P extends $ExcludeProjection<PU, KeepId>
			? OmitDeep<
					T,
					// @ts-expect-error
					P["_id"] extends 0
						? // @ts-expect-error
							P["_id"] extends 1
							? never
							: keyof P | "_id"
						: Exclude<keyof P, "_id">
				>
			: PickDeep<
					T,
					// @ts-expect-error
					P["_id"] extends 0
						? // @ts-expect-error
							P["_id"] extends 1
							? never
							: Exclude<keyof P, "_id">
						: keyof P | "_id"
				>,
		false,
		Options
	>;

	updateAsync<O extends UpdateOptions>(
		query: O["upsert"] extends true
			? Omit<$Query<T, T>, "_id"> & { _id: T["_id"] }
			: $Query<T, T>,
		updateQuery: $Update<Omit<T, "_id">, O["upsert"]>,
		options?: O,
	): Promise<{
		numAffected: number;
		affectedDocuments: O["returnUpdatedDocs"] extends true
			? O["multi"] extends true
				? Document<Untype<T, Options>>[] | null
				: Document<Untype<T, Options>> | null
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

type UpdateOptions = {
	multi?: boolean;
	returnUpdatedDocs?: boolean;
	upsert?: boolean;
};

interface CursorCount extends Promise<number> {}

interface Cursor<
	T extends Record<string, unknown>,
	Multi extends boolean,
	Options extends WrapOptions,
> extends Promise<
	Multi extends true
		? Document<Untype<T, Options>>[]
		: Document<Untype<T, Options>> | undefined
> {
	sort(query: Record<keyof T, 1 | -1>): Cursor<T, Multi, Options>;
	skip(n: number): Cursor<T, Multi, Options>;
	limit(n: number): Cursor<T, Multi, Options>;
	projection<
		P extends $ExcludeProjection<PU, KeepId> | $IncludeProjection<PU, KeepId>,
		PU extends Paths<T>,
		KeepId extends 0 | 1,
	>(
		projection: P,
	): Cursor<
		P extends $ExcludeProjection<PU, KeepId>
			? OmitDeep<
					T,
					// @ts-expect-error
					P["_id"] extends 0
						? // @ts-expect-error
							P["_id"] extends 1
							? never
							: keyof P | "_id"
						: Exclude<keyof P, "_id">
				>
			: PickDeep<
					T,
					// @ts-expect-error
					P["_id"] extends 0
						? // @ts-expect-error
							P["_id"] extends 1
							? never
							: Exclude<keyof P, "_id">
						: keyof P | "_id"
				>,
		Multi,
		Options
	>;
}

type NeverToUnknown<T> = [T] extends [never]
	? unknown
	: T extends Record<string, unknown>
		? { [K in keyof T]: NeverToUnknown<T[K]> }
		: T;

type Untype<
	T,
	Options extends WrapOptions,
> = Options["returnUntyped"] extends true ? unknown : NeverToUnknown<T>;

export function wrapNedbWithConfig<Options extends WrapOptions>(
	_options: Options,
) {
	return function wrap<T extends Record<string, unknown> & { _id: string }>(
		nedb: Nedb,
	): WrappedNedb<T, Options> {
		return nedb as WrappedNedb<T, Options>;
	};
}

export const wrapNedb = wrapNedbWithConfig({});
