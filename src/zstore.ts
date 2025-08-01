import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { z } from 'zod';

import { getDefaultValueFromSchema, stringifyObject } from './helpers.js';
import { Last, OptionsType, UpdateFunctionType, ZodWithVersion } from './types.js';

class ZStore<T extends ZodWithVersion[], I extends Last<T>> {
  readonly schema: ZodWithVersion;
  readonly name: string;
  readonly path: string;
  readonly defaultValues: z.TypeOf<I>;
  private _store: z.TypeOf<I>;

  constructor(opts: OptionsType<T, I>) {
    this.schema = opts.allSchemas[opts.allSchemas.length - 1];
    this.name = opts.name;

    const BASE_PATH = opts.path ?? './';

    this.path = path.join(BASE_PATH, opts.name + '.json');

    if (opts.defaults) this.defaultValues = Object.assign({}, opts.defaults);
    else this.defaultValues = getDefaultValueFromSchema(this.schema);

    this._store = this.defaultValues;

    try {
      const raw = readFileSync(this.path, 'utf-8');

      if (raw.length > 0) {
        const data = JSON.parse(raw);

        const d = this._migrateOrParseStore(data, opts.migrations);

        this._setStore(d);
      } else {
        this._setStore(this.defaultValues);
      }
    } catch (err: unknown) {
      if ((err as any)?.code === 'ENOENT') {
        this._setStore(this.defaultValues);
      } else {
        throw err;
      }
    }
  }

  private _migrateOrParseStore(
    rawData: unknown,
    migrations?: (store: z.infer<T[number]>) => z.infer<I>
  ): z.infer<I> {
    if (typeof rawData !== 'object' || rawData === null) {
      throw new Error('Invalid config format');
    }

    if ('storeVersion' in rawData && typeof rawData.storeVersion === 'number') {
      if (migrations)
        return migrations(rawData as z.infer<T[number]>); // run migrations and return the new state
      else return this.schema.parse(rawData); // throws an error if the data is not of type T
      // else return rawData;
    }

    throw new Error('Invalid store version');
  }

  private _getStore(): z.infer<I> {
    return Object.assign({}, this._store);
  }

  private _setStore(s: z.infer<I>) {
    const string = stringifyObject(s);
    mkdirSync(path.dirname(this.path), { recursive: true });
    writeFileSync(this.path, string, { encoding: 'utf-8' });
    this._store = Object.assign({}, s);
  }

  /**
   * Retrieves the current state of the store.
   *
   * @remarks
   * This getter provides direct access to the internal store, returning the current state
   * as validated by the schema.
   *
   * @returns The current state of the store.
   *
   * @example
   * const currentState = myStore.store;
   * console.log(currentState);
   */
  get store(): z.infer<I> {
    return this._getStore();
  }

  /**
   * Updates the internal state of the store either by merging the provided partial update object
   * or by applying a function to the current state.
   *
   * @param update - This can be either:
   *   1. An object that contains a partial update to the current state, excluding the 'version' field.
   *   2. A function that takes the current state (excluding the 'version' field) and returns a new state.
   *
   * @remarks
   * - If `update` is an object, it will be merged with the current state using `Object.assign`.
   * - If `update` is a function, the current state is first read from a file, parsed, passed to the function,
   *   and then the returned new state is stored.
   *
   * @throws Throws an error if the state does not match the schema after parsing.
   *
   * @example
   * // Example 1: Updating state with an object
   * set({ key: 'value' });
   *
   * // Example 2: Updating state with a function
   * set((currentState) => ({ ...currentState, key: 'newValue' }));
   *
   * @param {Omit<Partial<z.infer<I>>, 'version'> | UpdateFunctionType<Omit<z.infer<I>, 'version'>>} update
   *    - Either an object containing a partial update or a function that returns a new state.
   */
  set(update: Omit<Partial<z.infer<I>>, 'version'>): void;
  set(update: UpdateFunctionType<Omit<z.infer<I>, 'version'>>): void;
  set(
    update: Omit<Partial<z.infer<I>>, 'version'> | UpdateFunctionType<Omit<z.infer<I>, 'version'>>
  ): void {
    if (typeof update === 'object') {
      // const currentState = this.schema.parse(update);
      this._setStore(Object.assign(this._store, update));
    } else {
      const data = readFileSync(this.path, 'utf-8');
      const currentState = this.schema.parse(JSON.parse(data)) as z.infer<I>;
      const newState = update(currentState) as z.infer<I>;
      this._setStore(newState);
    }
  }

  /**
   * Resets the store to its default values.
   *
   * @remarks
   * This method restores the internal store state to the default values defined in the store.
   * It overwrites the current state with the predefined defaults, effectively resetting any changes.
   *
   * @example
   * myStore.reset();
   * console.log(myStore.store); // Outputs the default values of the store.
   */
  reset(): void {
    this._setStore(this.defaultValues);
  }
}

export default ZStore;
