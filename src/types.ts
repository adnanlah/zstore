import { AnyZodObject, z } from 'zod';

export type OptionsType<T extends AnyZodObject, I extends AnyZodObject[]> = {
  schema: T;
  allSchemas: I;
  name: string;
  path?: string;
  defaults?: Partial<z.infer<T>>;
  migrations?: (store: z.infer<I[number]>) => z.infer<T>;
};

export type UpdateFunctionType<T> = (prevState: T) => T;
