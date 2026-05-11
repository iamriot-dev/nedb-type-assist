import type { RequireAtLeastOne } from "type-fest";
import type { $Query, $QueryOps } from "./$Query";

export type $ArrayOps<
	A,
	B extends Record<string, unknown>,
> = RequireAtLeastOne<{
	$elemMatch?: A extends Record<string, unknown>
		? $Query<A, B> | $QueryOps<A> | Partial<A>
		: A extends Array<infer AA>
			? $ArrayOps<AA, B>
			: $QueryOps<A> | A;
	$size?: number;
}>;
