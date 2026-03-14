import bcrypt from "bcryptjs";

// Hash password using bcrypt
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = process.env.SALT_ROUNDS
    ? parseInt(process.env.SALT_ROUNDS)
    : 10;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password
export const verifyPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
