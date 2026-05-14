import type { EmptyObject, OmitDeep, Paths, PickDeep } from "type-fest";

export type $ExcludeProjection_WithoutId<PU extends string> = {
	[Key in PU]?: 0;
} & {
	_id: 0;
};

export type $ExcludeProjection_WithId<PU extends string> = {
	[Key in Exclude<PU, "_id">]?: 0;
} & {
	_id?: 1;
};

export type $IncludeProjection_WithoutId<PU extends string> = {
	[Key in Exclude<PU, "_id">]?: 1;
} & {
	_id: 0;
};

export type $IncludeProjection_WithId<PU extends string> = {
	[Key in PU]?: 1;
};

export type $AnyProjection<PU extends string> =
	| $ExcludeProjection_WithoutId<PU>
	| $ExcludeProjection_WithId<PU>
	| $IncludeProjection_WithoutId<PU>
	| $IncludeProjection_WithId<PU>;

export type $Projection<
	T extends Record<string, unknown>,
	P extends $AnyProjection<PU>,
	PU extends Paths<T>,
> =
	Paths<P> extends infer PP extends Paths<P>
		? PickDeep<P, Paths<T> & PP> extends infer StrictT
			? P extends EmptyObject
				? T
				: { _id: 1 } extends StrictT
					? T
					: { _id: 0 } extends StrictT
						? Omit<T, "_id">
						: P extends $IncludeProjection_WithId<PU>
							? PickDeep<T, Paths<T> & (PP | "_id")>
							: P extends $IncludeProjection_WithoutId<PU>
								? Omit<PickDeep<T, Paths<T> & PP>, "_id">
								: P extends $ExcludeProjection_WithId<PU>
									? OmitDeep<T, Exclude<PP, "_id">>
									: P extends $ExcludeProjection_WithoutId<PU>
										? OmitDeep<T, PP | "_id">
										: never
			: never
		: never;
