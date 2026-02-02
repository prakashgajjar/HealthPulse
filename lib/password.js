import bcryptjs from 'bcryptjs';

const saltRounds = 10;

export async function hashPassword(password) {
  const salt = await bcryptjs.genSalt(saltRounds);
  return await bcryptjs.hash(password, salt);
}

export async function comparePassword(password, hashedPassword) {
  return await bcryptjs.compare(password, hashedPassword);
}
