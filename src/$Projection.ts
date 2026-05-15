import type { MergeDeep, OmitDeep, Paths, PickDeep, ValueOf } from "type-fest";
import type {
	$ProjectionTransform,
	FilteredKeys,
} from "./$ProjectionTransform";

export type $ExcludeProjection<PU extends string> = {
	[Key in PU]?: 0;
} & {
	_id?: never;
} & {
	[Key in string as Key extends PU ? never : Key]: 0;
};

export type $IncludeProjection<PU extends string> = {
	[Key in PU]?: 1;
} & {
	id?: never;
} & {
	[Key in string as Key extends PU ? never : Key]: 1;
};

export type IsInvalidProjection<T extends Record<string, unknown>> =
	ValueOf<T> extends 0 ? false : ValueOf<T> extends 1 ? false : true;

export type $AnyProjection<PU extends string> =
	| $ExcludeProjection<PU>
	| $IncludeProjection<PU>;

export type $Projection<
	T extends Record<string, unknown>,
	P extends $AnyProjection<PU>,
	PU extends Paths<T>,
> =
	P extends $IncludeProjection<PU>
		? MergeDeep<
				PickDeep<T, Paths<T> & (Paths<P> | "_id")>,
				$ProjectionTransform<FilteredKeys<T, P>, T, {}>
			>
		: P extends $ExcludeProjection<PU>
			? OmitDeep<T, Exclude<Paths<P>, "_id">>
			: never;

declare const withoutIdSymbol: unique symbol;

export class WithoutId<_P extends $AnyProjection<PU>, PU extends string> {
	withoutId = true;
}

declare const fullWithoutIdSymbol: unique symbol;

export type FullWithoutId = {
	readonly [fullWithoutIdSymbol]: true;
};
