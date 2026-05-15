import type Nedb from "@seald-io/nedb";
import type { $AnyProjection, FullWithoutId, WithoutId } from "./$Projection";
import type { WrapOptions } from "./WrapOptions";
import type { WrappedNedb } from "./WrappedNedb";

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

export function withoutId(_projection: {}): FullWithoutId;
export function withoutId<P extends $AnyProjection<PU>, PU extends string>(
	_projection: P,
): WithoutId<P, PU>;
export function withoutId<P extends $AnyProjection<PU>, PU extends string>(
	_projection: P,
): WithoutId<P, PU> {
	return { ..._projection, _id: 0 } as unknown as WithoutId<P, PU>;
}
