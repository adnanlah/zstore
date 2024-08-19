import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

import { UserType, UserTypeV1, UserTypeV2 } from './schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const STORE_PATH = join(__dirname, './store');

function isUserTypeV1(user: UserType): user is UserTypeV1 {
  return user.version === 1;
}

function isUserTypeV2(user: UserType): user is UserTypeV2 {
  return user.version === 2;
}

function migrateV1ToV2(user: UserTypeV1): UserTypeV2 {
  return {
    version: 2,
    email: '06123455676',
    age: 12
  };
}

// Main migration function
export function migrateUser(user: UserType): UserTypeV2 {
  console.log('migrateUser');
  if (isUserTypeV1(user)) {
    user = migrateV1ToV2(user);
  }
  return user;
}
