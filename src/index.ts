import type Nedb from "@seald-io/nedb";
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
