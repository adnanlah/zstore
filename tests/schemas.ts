import { z } from 'zod';

export const userSchemaV1 = z.object({
  version: z.literal(1).default(1),
  name: z.string().default('Adnan'),
  age: z.number().default(30)
});

export const userSchemaV2 = z.object({
  version: z.literal(2).default(2),
  email: z.string().default(''),
  age: z.number().default(30)
});

export type UserTypeV1 = z.infer<typeof userSchemaV1>;
export type UserTypeV2 = z.infer<typeof userSchemaV2>;
export type UserType = UserTypeV1 | UserTypeV2;
