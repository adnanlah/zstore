import { z } from 'zod';

export const userSchemaV1 = z.object({
  version: z.literal(1),
  name: z.string(),
  age: z.number()
});

export const userSchemaV2 = z.object({
  version: z.literal(2),
  email: z.string(),
  age: z.number()
});

export type UserTypeV1 = z.infer<typeof userSchemaV1>;
export type UserTypeV2 = z.infer<typeof userSchemaV2>;
export type UserType = UserTypeV1 | UserTypeV2;
