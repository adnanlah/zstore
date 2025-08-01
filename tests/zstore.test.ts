import { assert } from 'chai';
import chalk from 'chalk';
import { existsSync, readFileSync, rmSync } from 'fs';
import { beforeEach, describe } from 'mocha';
import { join } from 'path';

import ZStore from '../src/index.js';
import { STORE_PATH, migrateUser } from './helpers.js';
import { userSchemaV1, userSchemaV2 } from './schemas.js';

const name = 'user';
const filePath = join(STORE_PATH, `${name}.json`);

beforeEach(function () {
  try {
    rmSync(STORE_PATH, { recursive: true });
  } catch (err) {
    console.error(chalk.redBright('Error while deleting store directory', err));
  }
});

describe('> Initialize a new store', function () {
  describe('> Create a new store file if it does not exist', function () {
    it('should create a .json file with the name passed in the options', function () {
      new ZStore({
        allSchemas: [userSchemaV1] as const,
        path: STORE_PATH,
        name,
        defaults: {
          age: 30,
          name: 'Adnan',
          storeVersion: 1
        }
      });

      const doesFileExist = existsSync(filePath);

      assert.isTrue(doesFileExist);
    });

    it('should create a .json file in /store directory with schema default values', function () {
      new ZStore({
        allSchemas: [userSchemaV1] as const,
        path: STORE_PATH,
        name: 'user',
        defaults: {
          age: 30,
          name: 'Adnan',
          storeVersion: 1
        }
      });

      const file = readFileSync(filePath, 'utf-8');

      const obj = JSON.parse(file);

      const result = userSchemaV1.safeParse(obj);

      assert.equal(result.success, true);
      assert.equal(result.data?.name, 'Adnan');
      assert.equal(result.data?.age, 30);
    });

    it('should create a .json file in /store directory with user default values', function () {
      new ZStore({
        allSchemas: [userSchemaV1] as const,
        path: STORE_PATH,
        name: 'user',
        defaults: {
          storeVersion: 1,
          name: 'John Doe',
          age: 20
        }
      });

      const file = readFileSync(filePath, 'utf-8');

      const obj = JSON.parse(file);

      const result = userSchemaV1.safeParse(obj);

      assert.equal(result.success, true);
      assert.equal(result.data?.name, 'John Doe');
      assert.equal(result.data?.age, 20);
    });
  });

  describe('> Load the store from the file if it exists', function () {
    it('should load the store', function () {
      const store = new ZStore({
        allSchemas: [userSchemaV1] as const,
        path: STORE_PATH,
        name: 'user',
        defaults: {
          age: 30,
          name: 'Adnan',
          storeVersion: 1
        }
      });

      store.set({
        name: 'John Doe'
      });

      const store2 = new ZStore({
        allSchemas: [userSchemaV1] as const,
        path: STORE_PATH,
        name: 'user',
        defaults: {
          age: 30,
          name: 'Adnan',
          storeVersion: 1
        }
      });

      assert.equal(store2.store.name, 'John Doe');
    });

    it('should load the store and run migrations', function () {
      const store1 = new ZStore({
        allSchemas: [userSchemaV1] as const,
        path: STORE_PATH,
        name: 'user',
        defaults: {
          age: 30,
          name: 'Adnan',
          storeVersion: 1
        }
      });

      const file = readFileSync(filePath, 'utf-8');

      const obj = JSON.parse(file);

      const result = userSchemaV1.safeParse(obj);

      assert.equal(result.success, true);
      assert.equal(result.data?.name, 'Adnan');
      assert.equal(result.data?.age, 30);

      const store2 = new ZStore({
        allSchemas: [userSchemaV1, userSchemaV2] as const,
        path: STORE_PATH,
        name: 'user',
        migrations: (s) => {
          // return migrateUser(s);
          if (s.storeVersion === 1) {
            return {
              storeVersion: 2 as const,
              email: 'test@test.com',
              age: 12
            };
          } else {
            return {
              storeVersion: 2 as const,
              email: 'test@test.com',
              age: 12
            };
          }
        },
        defaults: {
          age: 30,
          email: 'Adnan',
          storeVersion: 2
        }
      });

      assert.equal(store2.store?.storeVersion, 2);
      assert.isString(store2.store?.email);
      assert.isNotTrue(Object.keys(store2.store).includes('name'));
    });
  });
});

describe('> Update the store', function () {
  it('should update the store', function () {
    const store = new ZStore({
      allSchemas: [userSchemaV1] as const,
      path: STORE_PATH,
      name: 'user',
      defaults: {
        age: 30,
        name: 'Adnan',
        storeVersion: 1
      }
    });

    store.set({
      name: 'John Doe'
    });

    const file = readFileSync(filePath, 'utf-8');

    const obj = JSON.parse(file);

    const result = userSchemaV1.safeParse(obj);

    assert.equal(result.success, true);
    assert.equal(result.data?.name, 'John Doe');
    assert.equal(result.data?.age, 30);
  });
});
