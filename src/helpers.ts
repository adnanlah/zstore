import { AnyZodObject, z } from 'zod';

export function stringifyObject(obj: object) {
  return JSON.stringify(obj, null, 2);
}

export function getDefaultValueFromSchema<T extends AnyZodObject>(schema: T) {
  type SchemaState = z.infer<T>;
  const defaultValue = schema.parse({});
  return defaultValue as SchemaState;
}
