export type WrapOptions =
	| {
			returnUntyped?: boolean;
			enforceCustomId?: boolean;
			withTimestampData?: boolean;
			useCustomId?: never;
	  }
	| {
			returnUntyped?: boolean;
			enforceCustomId?: never;
			withTimestampData?: never;
			useCustomId?: boolean;
	  };
