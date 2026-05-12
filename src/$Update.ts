import type {
	EmptyObject,
	Get,
	IsOptional,
	NonNullableDeep,
	PartialDeep,
	Paths,
	RequireAtLeastOne,
} from "type-fest";
import type { $ArrayOps } from "./$ArrayOps";
import type {
	$addToSetOp,
	$incOp,
	$maxOp,
	$minOp,
	$pushOp,
	$UpdateUpsertableOps,
	$UpsertSetOp,
} from "./$Upsert";

export type $Update<
	T extends Record<string, unknown>,
	Upsert extends boolean | undefined,
	QPaths extends string,
	Push extends $pushOp<T>,
	AddToSet extends $addToSetOp<T>,
	Inc extends $incOp<T>,
	Min extends $minOp<T>,
	Max extends $maxOp<T>,
> =
	| T
	| (Upsert extends true
			? ($UpsertSetOp<
					T,
					QPaths,
					Push,
					AddToSet,
					Inc,
					Min,
					Max
				> extends EmptyObject
					? { $set?: PartialDeep<T> }
					: {
							$set: PartialDeep<T> &
								$UpsertSetOp<T, QPaths, Push, AddToSet, Inc, Min, Max>;
						}) &
					$UpdateBaseOps<T> &
					$UpdateUpsertableOps<T, Push, AddToSet, Inc, Min, Max>
			: RequireAtLeastOne<
					{
						$set?: {
							[Key in Paths<T>]?: NonNullableDeep<Get<T, Key>>;
						};
					} & $UpdateBaseOps<T> &
						$UpdateUpsertableOps<T, Push, AddToSet, Inc, Min, Max>
				>);

type $UpdateBaseOps<T extends Record<string, unknown>> = {
	$unset?: {
		[Key in Paths<T> as IsOptional<Get<T, Key>> extends true
			? Key
			: never]?: true;
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
};

export type UpdateOptions = {
	multi?: boolean;
	returnUpdatedDocs?: boolean;
	upsert?: boolean;
};
