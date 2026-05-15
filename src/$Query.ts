import type { Get, Paths, RequireAtLeastOne } from "type-fest";
import type { $ArrayOps } from "./$ArrayOps";

export type $Query<
  T extends Record<string, unknown>,
  B extends Record<string, unknown>,
> = {
  [Key in Paths<T, { leavesOnly: false }>]?: NonNullable<
    Get<T, Key>
  > extends Array<infer A>
    ? $ArrayOps<A, B> | A[]
    : NonNullable<Get<T, Key>> extends Record<string, unknown>
      ?
          | $Query<NonNullable<Get<T, Key>>, B>
          | $QueryOps<NonNullable<Get<T, Key>>>
          | Partial<Get<T, Key>>
      : Get<T, Key> | $QueryOps<Get<T, Key>>;
} & $QueryLogicOps<T, B>;

type $QueryLogicOps<
  T extends Record<string, unknown>,
  B extends Record<string, unknown>,
> = {
  $or?: $Query<T, B>[];
  $and?: $Query<T, B>[];
  $not?: $Query<T, B>;
  $where?: (this: B) => boolean;
};

export type $QueryOps<V> = V extends number | string | Date
  ? RequireAtLeastOne<$CompareOps<V> & $BaseOps<V>>
  : RequireAtLeastOne<$BaseOps<V>>;

type $CompareOps<V extends number | string | Date> = {
  $lt?: V;
  $lte?: V;
  $gt?: V;
  $gte?: V;
};

type $BaseOps<V> = {
  $in?: V[];
  $ne?: V;
  $nin?: V[];
  $exists?: boolean;
  $regex?: RegExp;
};
