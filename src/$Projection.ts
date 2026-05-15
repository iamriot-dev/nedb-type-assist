import type {
	ArrayLength,
	Entries,
	MergeDeep,
	OmitDeep,
	Paths,
	PickDeep,
	UnionToTuple,
} from "type-fest";
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

export type IsInvalidProjection<T extends Record<string, unknown>> = Entries<
	Omit<T, "_id">
>[0][1] extends infer Values
	? number extends Values
		? true
		: ArrayLength<UnionToTuple<Values>> extends 0 | 1
			? false
			: true
	: true;

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

export declare class WithoutId<
	_P extends $AnyProjection<PU>,
	PU extends string,
> {}

export declare class FullWithoutId {}
