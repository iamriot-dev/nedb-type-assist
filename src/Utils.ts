import type { WrapOptions } from "./WrapOptions";

export type GetEnforceCustomId<Options extends WrapOptions> =
	"enforceCustomId" extends keyof Options
		? Options["enforceCustomId"]
		: "useCustomId" extends keyof Options
			? Options["useCustomId"]
			: false;

type NeverToUnknown<T> = [T] extends [never]
	? unknown
	: T extends Record<string, unknown>
		? {
				[K in keyof T]: NeverToUnknown<T[K]>;
			}
		: T;

export type Augment<T, Options extends WrapOptions> = NeverToUnknown<
	WithTimestampData<Untype<T, Options>, Options>
>;

type Untype<
	T,
	Options extends WrapOptions,
> = Options["returnUntyped"] extends true ? unknown : T;

type WithTimestampData<
	T,
	Options extends WrapOptions,
> = Options["withTimestampData"] extends true
	? T & { createdAt: Date; updatedAt: Date }
	: T;
