import type { OmitDeep, Paths, PickDeep } from "type-fest";

export type $ExcludeProjection<PU extends string, KeepId extends 0 | 1> = {
	[Key in PU]?: Key extends "_id" ? KeepId : 0;
};

export type $IncludeProjection<PU extends string, KeepId extends 0 | 1> = {
	[Key in PU]?: Key extends "_id" ? KeepId : 1;
};

export type $Projection<
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
