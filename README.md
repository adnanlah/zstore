# ZStore

Simple data persistence for your Electron app or module - Save and load user settings, app state, cache, etc

## Usage

```ts
import { z } from 'zod';
import ZStore from 'zstore';

// version is mandantory
// default values are also mandatory
const userSchemaV1 = z.object({
  version: z.literal(1).default(1),
  name: z.string().default(''),
  age: z.number().default(0)
});

const userStore = new ZStore({
  schema: userSchemaV1,
  allSchemas: [userSchemaV1],
  name: 'user'
});

userStore.set({
  name: 'Adnan',
  age: 25
});

console.log(userStore.store);
```
