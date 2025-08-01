import { ZodLiteral, ZodObject, z } from 'zod';

export type ZodWithVersion = ZodObject<{ version: ZodLiteral<number> }>;

export type OptionsType<T extends ZodWithVersion, I extends ZodWithVersion[]> = {
  schema: T;
  allSchemas: I;
  name: string;
  path?: string;
  defaults: z.infer<T>;
  migrations?: (store: z.infer<I[number]>) => z.infer<T>;
};

export type UpdateFunctionType<T> = (prevState: T) => T;
