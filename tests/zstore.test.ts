import { assert } from 'chai';
import { existsSync, readFileSync } from 'fs';
import { describe } from 'mocha';
import { join } from 'path';

import ZStore from '../src/index.js';
import { STORE_PATH, cleanFolder, generateFileName, migrateUser } from './helpers.js';
import { userSchemaV1, userSchemaV2 } from './schemas.js';

cleanFolder();

describe('> Initialize a new store', function () {
  describe('> Create a new store file if it does not exist', function () {
    it('should create a .json file with the name passed in the options', function () {
      const { filename, storeName } = generateFileName('1');
      new ZStore({
        schemas: [userSchemaV1] as const,
        path: STORE_PATH,
        name: storeName,
        defaults: {
          age: 30,
          name: 'Adnan',
          storeVersion: 1
        }
      });

      const doesFileExist = existsSync(join(STORE_PATH, filename));

      assert.isTrue(doesFileExist);
    });

    it('should create a .json file in /store directory with schema default values', function () {
      const { filename, storeName } = generateFileName('2');
      new ZStore({
        schemas: [userSchemaV1] as const,
        path: STORE_PATH,
        name: storeName,
        defaults: {
          age: 30,
          name: 'Adnan',
          storeVersion: 1
        }
      });

      const file = readFileSync(join(STORE_PATH, filename), 'utf-8');

      const obj = JSON.parse(file);

      const result = userSchemaV1.safeParse(obj);

      assert.equal(result.success, true);
      assert.equal(result.data?.name, 'Adnan');
      assert.equal(result.data?.age, 30);
    });

    it('should create a .json file in /store directory with user default values', function () {
      const { filename, storeName } = generateFileName('3');
      new ZStore({
        schemas: [userSchemaV1] as const,
        path: STORE_PATH,
        name: storeName,
        defaults: {
          storeVersion: 1,
          name: 'John Doe',
          age: 20
        }
      });

      const file = readFileSync(join(STORE_PATH, filename), 'utf-8');

      const obj = JSON.parse(file);

      const result = userSchemaV1.safeParse(obj);

      assert.equal(result.success, true);
      assert.equal(result.data?.name, 'John Doe');
      assert.equal(result.data?.age, 20);
    });
  });

  describe('> Load the store from the file if it exists', function () {
    it('should load the store', function () {
      const { storeName } = generateFileName('4');
      const store = new ZStore({
        schemas: [userSchemaV1] as const,
        path: STORE_PATH,
        name: storeName,
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
        schemas: [userSchemaV1] as const,
        path: STORE_PATH,
        name: storeName,
        defaults: {
          age: 30,
          name: 'Adnan',
          storeVersion: 1
        }
      });

      assert.equal(store2.store.name, 'John Doe');
    });

    it('should load the store and run migrations', function () {
      const { filename, storeName } = generateFileName('5-1');
      const { storeName: storeName2 } = generateFileName('5-2');

      const store1 = new ZStore({
        schemas: [userSchemaV1] as const,
        path: STORE_PATH,
        name: storeName,
        defaults: {
          age: 30,
          name: 'Adnan',
          storeVersion: 1
        }
      });

      const file = readFileSync(join(STORE_PATH, filename), 'utf-8');

      const obj = JSON.parse(file);

      const result = userSchemaV1.safeParse(obj);

      assert.equal(result.success, true);
      assert.equal(result.data?.name, 'Adnan');
      assert.equal(result.data?.age, 30);

      const store2 = new ZStore({
        schemas: [userSchemaV1, userSchemaV2] as const,
        path: STORE_PATH,
        name: storeName2,
        migrations: (s) => {
          // return migrateUser(s);
          if (s.storeVersion === 1) {
            return {
              storeVersion: 2 as const,
              email: 'test@test.com',
              age: 12
            };
          } else {
            return s;
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
    const { filename, storeName } = generateFileName('6');
    const store = new ZStore({
      schemas: [userSchemaV1] as const,
      path: STORE_PATH,
      name: storeName,
      defaults: {
        age: 30,
        name: 'Adnan',
        storeVersion: 1
      }
    });

    store.set({
      name: 'John Doe'
    });

    const file = readFileSync(join(STORE_PATH, filename), 'utf-8');

    const obj = JSON.parse(file);

    const result = userSchemaV1.safeParse(obj);

    assert.equal(result.success, true);
    assert.equal(result.data?.name, 'John Doe');
    assert.equal(result.data?.age, 30);
  });
});
