import type { Document } from "@seald-io/nedb";
import type { Paths } from "type-fest";
import type { $AnyProjection, $Projection } from "./$Projection";
import type { Augment } from "./Utils";
import type { WrapOptions } from "./WrapOptions";

export interface CursorCount extends Promise<number> {}

export interface Cursor<
	T extends Record<string, unknown>,
	Multi extends boolean,
	Options extends WrapOptions,
	BaseT extends Record<string, unknown> = T,
> extends Promise<
	Multi extends true
		? Document<Augment<T, Options>>[]
		: Document<Augment<T, Options>> | undefined
> {
	sort(query: Record<keyof T, 1 | -1>): Cursor<T, Multi, Options>;
	skip(n: number): Cursor<T, Multi, Options>;
	limit(n: number): Cursor<T, Multi, Options>;
	projection<P extends $AnyProjection<PU>, PU extends Paths<BaseT>>(
		projection: P,
	): Cursor<$Projection<BaseT, P, PU>, Multi, Options, BaseT>;
}
