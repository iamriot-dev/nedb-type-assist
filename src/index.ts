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
		? $ArrayOps<A, B> | A[]
		: NonNullable<Get<T, Key>> extends Record<string, unknown>
			?
					| $Query<NonNullable<Get<T, Key>>, B>
					| $QueryOps<NonNullable<Get<T, Key>>>
					| Partial<Get<T, Key>>
			: Get<T, Key> | $QueryOps<Get<T, Key>>;
} & $QueryLogicOps<T, B>;

type $QueryLogicOps<
	T extends Record<string, unknown>,
	B extends Record<string, unknown>,
> = {
	$or?: $Query<T, B>[];
	$and?: $Query<T, B>[];
	$not?: $Query<T, B>;
	$where?: (this: B) => boolean;
};

type $QueryOps<V> = V extends number | string | Date
	? RequireAtLeastOne<$CompareOps<V> & $BaseOps<V>>
	: RequireAtLeastOne<$BaseOps<V>>;

type $CompareOps<V extends number | string | Date> = {
	$lt?: V;
	$lte?: V;
	$gt?: V;
	$gte?: V;
};

type $BaseOps<V> = {
	$in?: V[];
	$ne?: V;
	$nin?: V[];
	$exists?: boolean;
	$regex?: RegExp;
};

type $ArrayOps<A, B extends Record<string, unknown>> = RequireAtLeastOne<{
	$elemMatch?: A extends Record<string, unknown>
		? $Query<A, B> | $QueryOps<A> | Partial<A>
		: A extends Array<infer AA>
			? $ArrayOps<AA, B>
			: $QueryOps<A> | A;
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
> =
	| Omit<T, "_id">
	| (Upsert extends true
			? { $set: Omit<T, "_id"> } & $UpdateBaseOps<T>
			: RequireAtLeastOne<
					{
						$set?: { [Key in Paths<T>]?: NonNullableDeep<Get<T, Key>> };
					} & $UpdateBaseOps<T>
				>);

type $UpdateBaseOps<T extends Record<string, unknown>> = {
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
			? (Pick<$ArrayOps<A, never>, "$elemMatch"> | { $in: A[] }) | A
			: never;
	};
	$pop?: {
		[Key in Paths<T> as NonNullable<Get<T, Key>> extends Array<infer _>
			? Key
			: never]?: NonNullable<Get<T, Key>> extends Array<infer _>
			? 1 | -1
			: never;
	};
	$addToSet?: {
		[Key in Paths<T> as NonNullable<Get<T, Key>> extends Array<infer _>
			? Key
			: never]?: NonNullable<Get<T, Key>> extends Array<infer A>
			? A | RequireAtLeastOne<{ $each?: A[]; $slice?: number }>
			: never;
	};
	$inc?: {
		[Key in Paths<T> as NonNullable<Get<T, Key>> extends number
			? Key
			: never]?: NonNullable<Get<T, Key>>;
	};
	$min?: {
		[Key in Paths<T> as NonNullable<Get<T, Key>> extends string | number | Date
			? Key
			: never]?: NonNullable<Get<T, Key>>;
	};
	$max?: {
		[Key in Paths<T> as NonNullable<Get<T, Key>> extends string | number | Date
			? Key
			: never]?: NonNullable<Get<T, Key>>;
	};
};

type WrapOptions =
	| {
			returnUntyped?: boolean;
			enforceCustomId?: boolean;
			withTimestampData?: boolean;
			useCustomId?: never;
	  }
	| {
			returnUntyped?: boolean;
			enforceCustomId?: never;
			withTimestampData?: never;
			useCustomId?: boolean;
	  };

type GetEnforceCustomId<Options extends WrapOptions> =
	"enforceCustomId" extends keyof Options
		? Options["enforceCustomId"]
		: "useCustomId" extends keyof Options
			? Options["useCustomId"]
			: false;

type WrappedNedb<
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
		? Document<Augment<T, Options>>[]
		: Document<Augment<T, Options>> | undefined
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

type Augment<T, Options extends WrapOptions> = WithTimestampData<
	Untype<T, Options>,
	Options
>;

type Untype<
	T,
	Options extends WrapOptions,
> = Options["returnUntyped"] extends true ? unknown : NeverToUnknown<T>;

type WithTimestampData<
	T,
	Options extends WrapOptions,
> = Options["withTimestampData"] extends true
	? T & { createdAt: Date; updatedAt: Date }
	: T;

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

type $Projection<
	T extends Record<string, unknown>,
	P extends $ExcludeProjection<PU, KeepId> | $IncludeProjection<PU, KeepId>,
	PU extends Paths<T>,
	KeepId extends 0 | 1,
> =
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
			>;
