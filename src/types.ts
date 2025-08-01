import { ZodLiteral, ZodObject, z } from 'zod';

export type ZodWithVersion = ZodObject<{ storeVersion: ZodLiteral<number> }>;
export type Last<T extends any[]> = T extends [...infer _, infer L] ? L : never;

export type OptionsType<T extends ZodWithVersion[], I extends Last<T>> = {
  allSchemas: T;
  name: string;
  defaults: z.infer<I>;
  path?: string;
  migrations?: (store: z.infer<T[number]>) => z.infer<I>;
};

export type UpdateFunctionType<T> = (prevState: T) => T;
