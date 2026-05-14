import type {
	ArraySlice,
	Get,
	MergeDeep,
	Paths,
	Split,
	UnionToTuple,
} from "type-fest";
import type { $AnyProjection } from "./$Projection";

declare class PlaceholderValue {}

type Traversal<
	Keys extends string[],
	Value,
	Placeholder,
	InsideArray extends boolean = false,
> =
	// If numeric key
	Keys[0] extends infer NumericKey extends `${number}`
		? // If value is array...
			Value extends Array<infer ArrayValue>
			? // Enter recusrion with ArrayValue
				Traversal<
					ArraySlice<Keys, 1>,
					NonNullable<ArrayValue>,
					Placeholder,
					// Mark as inside array
					true
				>
			: // Else if value is not array...
				// If currently inside array
				InsideArray extends true
				? // Traverse with value
					Traversal<ArraySlice<Keys, 1>, Value, Placeholder>
				: //Else if not inside array
					// Check if current numeric key exists on object
					NumericKey extends keyof Value
					? // Traverse using numeric key
						Traversal<
							ArraySlice<Keys, 1>,
							NonNullable<Get<Value, NumericKey>>,
							Placeholder
						>
					: // Numeric key was used on object without numeric key, ABORT!
						never
		: // If string key
			Keys[0] extends infer StringKey extends string
			? // If string key exists on object
				StringKey extends keyof Value
				? // If Value[StringKey] is array...
					NonNullable<Get<Value, StringKey>> extends Array<infer ArrayValue>
					? // Enter recusrion with ArrayValue
						Traversal<
							ArraySlice<Keys, 1>,
							NonNullable<ArrayValue>,
							Placeholder[],
							// Mark as inside array
							true
						>
					: // Else if value is not array, traverse using Value[StringKey]
						Traversal<
							ArraySlice<Keys, 1>,
							NonNullable<Get<Value, StringKey>>,
							Placeholder
						>
				: // Else if string key does not exist on object, ABORT!
					never
			: // else if no more keys, return value
				ReplacePlaceholder<Placeholder, Value>;

type ReplacePlaceholder<P, V> = PlaceholderValue extends P
	? V
	: P extends (infer A)[]
		? ReplacePlaceholder<A, V>[]
		: never;

type DeepCreate<Keys extends string[], Value> = Keys[0] extends string
	? {
			[K in Keys[0]]?: Keys[0] extends `${number}`
				? Value extends (infer ArrayValue)[]
					? DeepCreate<ArraySlice<Keys, 1>, ArrayValue>
					: never
				: DeepCreate<ArraySlice<Keys, 1>, Value>;
		}
	: Value;

type BaseKeys<T, Projection> = Paths<Projection> &
	Paths<T, { bracketNotation: true }>;

type ExtraKeys<Projection, BaseKeys> = Exclude<Paths<Projection>, BaseKeys>;

type UnfindMatch<
	String extends string,
	Matches extends readonly unknown[],
> = Matches[0] extends string
	? String extends `${Matches[0]}${string}`
		? never
		: UnfindMatch<String, ArraySlice<Matches, 1>>
	: String;

export type FilteredKeys<
	T extends Record<string, unknown>,
	Projection extends $AnyProjection<string>,
> =
	BaseKeys<T, Projection> extends infer BaseKeys extends string
		? UnionToTuple<
				Split<
					UnfindMatch<ExtraKeys<Projection, BaseKeys>, UnionToTuple<BaseKeys>>,
					"."
				>
			>
		: never;

export type $ProjectionTransform<
	Keys extends string[][],
	Original,
	Memo,
> = Keys[0] extends string[]
	? $ProjectionTransform<
			ArraySlice<Keys, 1>,
			Original,
			MergeDeep<
				Memo,
				DeepCreate<Keys[0], Traversal<Keys[0], Original, PlaceholderValue>>
			>
		>
	: Memo;
