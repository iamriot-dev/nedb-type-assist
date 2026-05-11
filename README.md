# 🪄 NeDB Type Assist

A simple type assistant for NeDB, to add some type safety to your NeDB operations.

- 🪶 **Lightweight**
  - Only 1 (types only) dependency, `type-fest`
  - No runtime overhead
- ⚙️ **Easy to use**
  - Simply wrap your DataStore with `wrapNedb<T>()` and annotate with your types
  - No need to completely change your existing code
- 🪖 **Type safe**
  - Get type safety for your NeDB operations, including queries, inserts, updates, and projections
  - No more guessing what type of data you are working with
- ☑️ **Customisable**
  - You can set assist to return untyped data, enforcing manual run-time type validation
  - Lets you use your favourite validation library

## 📖 Table of Contents

- [📥 Installing](#-installing-)
- [🚀 Quick Start](#-quick-start-)
- [🛠️ Customisation](#️-customisation-)
- [📝 Supported Methods](#-supported-methods-)
- [⚠️ Limitations](#️-limitations-)
  - [💭 Limitations of Array Projections](#-limitations-of-array-projections-)
  - [🔦 Limitations of `$elemMatch`](#-limitations-of-elemmatch-)
  - [🔍 Looking for solutions](#-looking-for-solutions-)

## 📥 Installing <small>[⤴](#-table-of-contents)</small>

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

## 🚀 Quick Start <small>[⤴](#-table-of-contents)</small>

```typescript
import DataStore from "@seald-io/nedb";
import { wrapNedb } from "nedb-type-assist";

interface User {
  _id: string; // Required
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

## 🛠️ Customisation <small>[⤴](#-table-of-contents)</small>

```typescript
import DataStore from "@seald-io/nedb";
import { wrapNedb } from "nedb-type-assist";

interface User {
  _id: string; // Required
  name: string;
  age: number;
}

const myCustomWrapper = wrapNedbWithConfig({
  returnUntyped: true, // (Optional, default: false)
  // When true, returns untyped data, enforcing manual run-time type validation

  enforceCustomId: true, // (Optional, default: false)
  // When true, IDs must be provided when inserting

  withTimestampData: true, // (Optional, default: false)
  // Set to true if using the `timestampData` option on the NeDB instance
  // This will add `createdAt` and `updatedAt` properties to the returned types
  // Do not add `createdAt` and `updatedAt` to your data types
});

const db = myCustomWrapper<User>(
  new DataStore({
    // Set your NeDB options here...

    // ⚠️ Remember to set withTimestampData to true if you set this to true
    timestampData: true,
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

  // ⚠️ Only include if you set `withTimestampData` to true
  createdAt: z.date(),
  updatedAt: z.date(),
});

try {
  const validatedUser = UserSchema.parse(user);
  // ✅ validatedUser is of type User
} catch (e) {
  // Handle error...
}
```

```typescript
// You can also wrap with settings directly
const wrappedDb = wrapNedbWithConfig({
  // Set your assist options here...
})<User>(
  new DataStore({
    // Set your NeDB options here...
  }),
);
```

```typescript
// If you wish to have access to the NeDB instance, you can use the following:
const unwrappedDb = new DataStore({
  // Set your NeDB options here...
});

const wrappedDb = wrapNedb<User>(unwrappedDb);

// Note that `wrappedDb` and `unwrappedDb` are the same instance, just with different types
// At runtime, there is no difference between the two
unwrappedDb === wrappedDb; // true
```

## 📝 Supported Methods <small>[⤴](#-table-of-contents)</small>

- `insertAsync()`
- `findAsync()`
- `findOneAsync()`
- `updateAsync()`
- `removeAsync()`
- `countAsync()`
- `setAutocompactionInterval()`
- `stopAutocompaction()`
- `compactDatafileAsync()`
- `ensureIndexAsync()`
- `removeIndexAsync()`
- `loadDatabaseAsync()`
- `getAllData()`

Cursors methods are also available after `findAsync()` and `findOneAsync()`:

- `sort()`
- `skip()`
- `limit()`
- `projection()`

The `autoloadPromise` property is also available for awaiting.

Refer to the NeDB documentation for more information on these methods.

## ⚠️ Limitations <small>[⤴](#-table-of-contents)</small>

- There is **_no runtime validation_** provided, so if you provide incorrect types, you may get runtime errors. Always ensure your types are correct and consider using a validation library for critical operations.
- The types provided by this library are based on the NeDB documentation and may not cover all edge cases or advanced usage patterns. Always refer to the NeDB documentation for complex queries and updates to ensure type safety.
- There may still be runtime errors even if the types are correct, due to the dynamic nature of JavaScript and NeDB's flexible querying and updating capabilities. Always test your code thoroughly to catch any potential issues.
- The type system may struggle with polymorphic types. To avoid issues, follow NeDB's recommendation and use different instances for different types of data.

### 🔦 Limitations of `$elemMatch` <small>[⤴](#-table-of-contents)</small>

Due to limitations with `$elemMatch`, avoid having arrays that mixes primitive values, objects, and arrays in your documents. If you need to store arrays of different types, consider using a separate field for each type. For example:

```typescript
type BadArray = (string | { count: number })[]; // ❌ not recommended
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
type SimpleArray = string[]; // ✅ recommended
type ObjectArray = { count: number }[]; // ✅ recommended

// also works, but use with care
type PrimitivesArray = (string | number | boolean)[];
```

### 💭 Limitations of Array Projections <small>[⤴](#-table-of-contents)</small>

Projections allow you to use dot notation to select specific fields. It works correctly on nested objects. However, due to the complex manner NeDB handles array projection, types will be removed when dealing with projections into arrays. It is recommended to manually typecheck these fields instead. For example:

```typescript
type Customer = {
  _id: string;
  name: string;

  contact: {
    phone: number[];
    email: string;
    address: {
      line1: string;
      line2: string;
    };
  };

  preorders?: {
    isbn: number;
    title: string;
    paid: boolean;
  }[];

  books: {
    isbn: number;
    title: string;
  }[];
};

const MyDB = wrapNedb<Customer>(new DataStore());

const myCustomResult = await MyDB.findOneAsync(
  {},
  {
    name: 1,
    "contact.email": 1,
    "contact.address.line1": 1,
    "preorders.isbn": 1, // projects values inside an array
    "books.isbn": 1, // projects values inside an array
  },
);

// The actual type of myCustomResult during runtime is:
type ActualType =
  | {
      _id: string;
      name: string;
      contact: {
        email: string;
        address: {
          line1: string;
        };
      };

      // ⚠️ Notice that preorders[].isbn is remapped to preorders.isbn[] by NeDB
      preorders?: {
        isbn: number[];
      };

      // ⚠️ Remapping also happens with books
      books: {
        isbn: number[];
      };
    }
  | undefined;

// However, the static type give will be:
type StaticType =
  | {
      _id: string;
      name: string;
      // ✅ Contact is correctly projected
      contact: {
        email: string;
        address: {
          line1: string;
        };
      };

      // 🛡️ For safety, preorders is left undefined
      // You can manually type check it if you wish
      preoders?: undefined;

      // 🛡️ books is set to unknown because it cannot be undefined
      books: unknown;
    }
  | undefined;
```

#### Alternative projection

```typescript
const myCustomResultAlt = await MyDB.findOneAsync(
  {},
  {
    name: 1,
    "contact.email": 1,
    "contact.address.line1": 1,
    preorders: 1, // 👈 This has been added
    "preorders.isbn": 1,
    "books.isbn": 1,
  },
);

// The actual type of myCustomResult2 during runtime is:
type ActualTypeAlt =
  | {
      // ... same as before

      // ‼️ Notice that preorders[].isbn is no longer remapped
      preorders?: {
        isbn: number;
      }[];

      // ⚠️ Remapping still happens with books because `books: 1` was not specified
      books: {
        isbn: number[];
      };
    }
  | undefined;

// The static type keeps undefined/unknown just like before
type StaticTypeAlt = {
  // ... same as before

  preorders?: undefined; // still undefined
  books: unknown; // still unknown
};
```

#### Recommended projection

```typescript
const recommendedResult = await MyDB.findOneAsync(
  {},
  {
    name: 1,
    "contact.email": 1,
    "contact.address.line1": 1,
    preorders: 1, // 👈 projection stops at the array
    books: 1, // 👈 projection stops at the array

    "contact.phone": 1, // 👈 projection stops at the array
  },
);

type ResultType = {
  _id: string;
  name: string;

  // ✅ contact is correctly projected
  contact: {
    phone: number[]; // 👈 array is correctly typed
    email: string;
    address: {
      line1: string;
    };
  };

  // ✅ preorders is correctly projected
  preorders?: {
    isbn: number;
    title: string;
    paid: boolean;
  }[];

  // ✅ books is correctly projected
  books: {
    isbn: number;
    title: string;
  }[];
};
```

### 🔍 Looking for solutions <small>[⤴](#-table-of-contents)</small>

If you have any suggestions or solutions to resolve the any of the above limitations, please feel free to open an issue or a PR.
