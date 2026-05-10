# 🪄 NeDB Type Assist

A simple type assistant for NeDB, to add some type safety to your NeDB operations.

- 🪶 **Lightweight**
  - Only 1 (types only) dependency, `type-fest`
  - No runtime overhead
- ⚙️ **Easy to use**
  - Simply wrap your DataStore with `wrapNedb<T>()` and annotate with your types
  - No need to completely change your existing code
- 🪖 **Type safe**
  - Get type safety for your NeDB operations, including queries, inserts, and updates
  - No more guessing what type of data you are working with
- ☑️ **Customisable**
  - You can set assist to return untyped data, enforcing manual run-time type validation
  - Let's you use your favourite validation library

## 📥 Installing

```bash
npm install --save nedb-type-assist
# or
yarn add nedb-type-assist
# or
pnpm add nedb-type-assist
```

Install NeDB if you have not already:

```bash
npm install --save @seald-io/nedb
# or
yarn add @seald-io/nedb
# or
pnpm add @seald-io/nedb
```

## 🚀 Quick Start

```typescript
import DataStore from "@seald-io/nedb";
import { wrapNedb } from "nedb-type-assist";

interface User {
	_id: string; // Optional if you want to use NeDB's auto-generated IDs
	name: string;
	age: number;
}

// Wrap your NeDB instance, providing your types as a generic parameter
// Note that DataStore is not modified, it is returned as is, but with a new types
const db = wrapNedb<User>(
	new DataStore({
		// Set your NeDB options here...
	}),
);

await db.insertAsync({ name: "Alice", age: 30 });
// ✅ Type safe

const user = await db.findOneAsync({ age: { $gte: 30 } });
// ✅ user is of type User | null

await db.updateAsync({ name: "Alice" }, { $set: { age: "Seventy" } });
// ❌ Type error: age should be a number, not a string  ^^^^^^^
```

## 🛠️ Customisation

```typescript
import DataStore from "@seald-io/nedb";
import { wrapNedb } from "nedb-type-assist";

interface User {
	_id: string; // Optional if you want to use NeDB's auto-generated IDs
	name: string;
	age: number;
}

const myCustomWrapper = wrapNedbWithConfig({
	returnUntyped: true, // (Optional, default: false)
	// Return untyped data, enforcing manual run-time type validation

	useCustomId: true, // (Optional, default: false)
	// Use custom IDs, you will be asked to provide IDs when inserting, upsert will not be available
});

const db = myCustomWrapper<User>(
	new DataStore({
		// Set your NeDB options here...
	}),
);

await db.insertAsync({ _id: "custom-id-123", name: "Alice", age: 30 });
// ✅ Type safe, but you must provide an _id

const user = await db.findOneAsync({ age: { $gte: 30 } });
// ⚠️ user is of type `{ _id: string } | null`, you must validate it yourself

// Use your favourite validation library
import { z } from "zod";

const UserSchema = z.object({
	_id: z.string(), // Remember to include _id
	name: z.string(),
	age: z.number(),
});

try {
	const validatedUSer = UserSchema.parse(user);
	// ✅ validatedUser is of type User
} catch (e) {
	// Handle error...
}

// If you wish to have access to the NeDB instance, you can use the following:
const unwrappedDb = new DataStore({
	// Set your NeDB options here...
});

const wrappedDb = wrapNedb<User>(unwrappedDb);

// Note that `wrappedDb` and `unwrappedDb` are the same instance, just with different types
// At runtime, there is no difference between the two
unwrappedDb === wrappedDb; // true
```

## 📝 Supported Methods

- `insertAsync()`
- `findAsync()`
- `findOneAsync()`
- `updateAsync()`
- `removeAsync()`
- `countAsync()`
- `setAutocompactionInterval()`
- `compactDatafileAsync()`
- `ensureIndexAsync()`

Cursors methods are also available after `findAsync()` and `findOneAsync()`:

- `sort()`
- `skip()`
- `limit()`
- `projection()`

Refer to the NeDB documentation for more information on these methods.

## ⚠️ Limitations

- There is **_no runtime validation_** provided, so if you provide incorrect types, you may get runtime errors. Always ensure your types are correct and consider using a validation library for critical operations.
- Projections currently do not reflect projected fields in the return type. Return type will be `Document<unknown>`.
  - **Workaround:** Perform validation on the returned data, or use a type assertion to ensure the returned type is correct.
- Upsert cannot be used with custom IDs. This is because NeDB does not allow you to modify the `_id` field after insertion.
- When using upsert, the update query must be a complete document, this is because inserting with a partial document would not be type safe.
  - **Workaround:** Check if a document exists, and perform insert or update accordingly.
- The types provided by this library are based on the NeDB documentation and may not cover all edge cases or advanced usage patterns. Always refer to the NeDB documentation for complex queries and updates to ensure type safety.
- There may still be runtime errors even if the types are correct, due to the dynamic nature of JavaScript and NeDB's flexible querying and updating capabilities. Always test your code thoroughly to catch any potential issues.
- The type system may struggle with polymorphic types. To avoid issues, follow NeDB's recommendation and use different instances for different types of data.
- Due to limitations with `$elemMatch`, avoid having arrays that mixes primitive values, objects, and arrays in your documents. If you need to store arrays of different types, consider using a separate field for each type. For example:

```typescript
type BadArray = (string | { count: number })[];               // ❌ not recommended
type WorseArray = (string | { count: number } | boolean[])[]; // ❌ not recommended

// Instead, use separate fields for each type
// Using a union type to allow for either count or text, but not both in the same object
type ValueContainer =
	| {
			count: number;
			text?: undefined;
	  }
	| {
			count?: undefined;
			text: string;
	  };

type BetterMixedArray = ValueContainer[]; // ✅ recommended (array of objects)
type SimpleArray = string[];              // ✅ recommended
type ObjectArray = { count: number }[];   // ✅ recommended

// also works, but use with care
type PrimitivesArray = (string | number | boolean)[];
```
