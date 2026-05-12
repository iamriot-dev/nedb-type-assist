import type {
	Get,
	IsOptional,
	NonNullableDeep,
	Paths,
	RequireAtLeastOne,
} from "type-fest";
import type { $ArrayOps } from "./$ArrayOps";

export type $Update<
	T extends Record<string, unknown>,
	Upsert extends boolean | undefined,
> =
	| Omit<T, "_id">
	| (Upsert extends true
			? { $set: Omit<T, "_id"> } & $UpdateBaseOps<T>
			: RequireAtLeastOne<
					{
						$set?: {
							[Key in Paths<T>]?: Omit<NonNullableDeep<Get<T, Key>>, "_id">;
						};
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

export type UpdateOptions = {
	multi?: boolean;
	returnUpdatedDocs?: boolean;
	upsert?: boolean;
};
