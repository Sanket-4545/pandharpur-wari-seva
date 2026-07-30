import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}
