import { assert } from 'chai';
import chalk from 'chalk';
import { existsSync, readFileSync, rmSync } from 'fs';
import { beforeEach, describe } from 'mocha';
import { join } from 'path';

import ZStore from '../src/index.js';
import { STORE_PATH, migrateUser } from './helpers.js';
import { UserTypeV2, userSchemaV1, userSchemaV2 } from './schemas.js';

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
      const name = 'user';
      new ZStore({
        schema: userSchemaV1,
        allSchemas: [userSchemaV1],
        path: STORE_PATH,
        name
      });

      const doesFileExist = existsSync(join(STORE_PATH, `${name}.json`));

      assert.isTrue(doesFileExist);
    });

    it('should create a .json file in /store directory with schema default values', function () {
      new ZStore({
        schema: userSchemaV1,
        allSchemas: [userSchemaV1],
        path: STORE_PATH,
        name: 'user'
      });

      const file = readFileSync(join(STORE_PATH, 'user.json'), 'utf-8');

      const obj = JSON.parse(file);

      const result = userSchemaV1.safeParse(obj);

      assert.equal(result.success, true);
      assert.equal(result.data?.name, 'Adnan');
      assert.equal(result.data?.age, 30);
    });

    it('should create a .json file in /store directory with user default values', function () {
      new ZStore({
        schema: userSchemaV1,
        allSchemas: [userSchemaV1],
        path: STORE_PATH,
        name: 'user',
        defaults: {
          name: 'John Doe',
          age: 20
        }
      });

      const file = readFileSync(join(STORE_PATH, 'user.json'), 'utf-8');

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
        schema: userSchemaV1,
        allSchemas: [userSchemaV1],
        path: STORE_PATH,
        name: 'user'
      });

      store.set({
        name: 'John Doe'
      });

      const store2 = new ZStore({
        schema: userSchemaV1,
        allSchemas: [userSchemaV1],
        path: STORE_PATH,
        name: 'user'
      });

      assert.equal(store2.store.name, 'John Doe');
    });

    it('should load the store and run migrations', function () {
      const store1 = new ZStore({
        schema: userSchemaV1,
        allSchemas: [userSchemaV1],
        path: STORE_PATH,
        name: 'user'
      });

      const file = readFileSync(join(STORE_PATH, 'user.json'), 'utf-8');

      const obj = JSON.parse(file);

      const result = userSchemaV1.safeParse(obj);

      assert.equal(result.success, true);
      assert.equal(result.data?.name, 'Adnan');
      assert.equal(result.data?.age, 30);

      const store2 = new ZStore({
        schema: userSchemaV2,
        allSchemas: [userSchemaV1, userSchemaV2],
        path: STORE_PATH,
        name: 'user',
        migrations: (s) => {
          // return migrateUser(s);
          if (s.version === 1) {
            return {
              version: 2 as const,
              email: 'test@test.com',
              age: 12
            };
          } else {
            return {
              version: 2 as const,
              email: 'test@test.com',
              age: 12
            };
          }
        }
      });

      assert.equal(store2.store?.version, 2);
      assert.isString(store2.store?.email);
      assert.isNotTrue(Object.keys(store2.store).includes('name'));
    });
  });
});

describe('> Update the store', function () {
  it('should update the store', function () {
    const store = new ZStore({
      schema: userSchemaV1,
      allSchemas: [userSchemaV1],
      path: STORE_PATH,
      name: 'user'
    });

    store.set({
      name: 'John Doe'
    });

    const file = readFileSync(join(STORE_PATH, 'user.json'), 'utf-8');

    const obj = JSON.parse(file);

    const result = userSchemaV1.safeParse(obj);

    assert.equal(result.success, true);
    assert.equal(result.data?.name, 'John Doe');
    assert.equal(result.data?.age, 30);
  });
});
