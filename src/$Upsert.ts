import type { Get, OmitDeep, Paths, RequireAtLeastOne } from "type-fest";

export type $UpdateUpsertableOps<
	T extends Record<string, unknown>,
	Push extends $pushOp<T>,
	AddToSet extends $addToSetOp<T>,
	Inc extends $incOp<T>,
	Min extends $minOp<T>,
	Max extends $maxOp<T>,
> = {
	$push?: Push;
	$addToSet?: AddToSet;
	$inc?: Inc;
	$min?: Min;
	$max?: Max;
};

export type $pushOp<T extends Record<string, unknown>> = {
	[Key in Paths<T> as NonNullable<Get<T, Key>> extends Array<infer _>
		? Key
		: never]?: NonNullable<Get<T, Key>> extends Array<infer A>
		?
				| A
				| RequireAtLeastOne<{
						$each?: A[];
						$slice?: number;
				  }>
		: never;
};

export type $addToSetOp<T extends Record<string, unknown>> = {
	[Key in Paths<T> as NonNullable<Get<T, Key>> extends Array<infer _>
		? Key
		: never]?: NonNullable<Get<T, Key>> extends Array<infer A>
		?
				| A
				| RequireAtLeastOne<{
						$each?: A[];
						$slice?: number;
				  }>
		: never;
};

export type $incOp<T extends Record<string, unknown>> = {
	[Key in Paths<T> as NonNullable<Get<T, Key>> extends number
		? Key
		: never]?: NonNullable<Get<T, Key>>;
};

export type $minOp<T extends Record<string, unknown>> = {
	[Key in Paths<T> as NonNullable<Get<T, Key>> extends string | number | Date
		? Key
		: never]?: NonNullable<Get<T, Key>>;
};

export type $maxOp<T extends Record<string, unknown>> = {
	[Key in Paths<T> as NonNullable<Get<T, Key>> extends string | number | Date
		? Key
		: never]?: NonNullable<Get<T, Key>>;
};

export type $UpsertSetOp<
	T extends Record<string, unknown>,
	QPaths extends string,
	Push extends $pushOp<T>,
	AddToSet extends $addToSetOp<T>,
	Inc extends $incOp<T>,
	Min extends $minOp<T>,
	Max extends $maxOp<T>,
> = OmitDeep<
	T,
	| QPaths
	| ($pushOp<T> extends Push ? never : Paths<Push>)
	| ($addToSetOp<T> extends AddToSet ? never : Paths<AddToSet>)
	| ($incOp<T> extends Inc ? never : Paths<Inc>)
	| ($minOp<T> extends Min ? never : Paths<Min>)
	| ($maxOp<T> extends Max ? never : Paths<Max>)
>;
