import { verifyPassword } from "@/helpers/hashPassword";
import { AppError } from "@/middlewares/globalResponse";
import User from "@/models/user.model";
import { SignInValidationSchema } from "@/validations/auth/signIn.validation";
import { Context } from "hono";

export const signInAction = async (c: Context) => {
  try {
    const { email, password }: SignInValidationSchema = await c.req.json();
    const existingUser = await User.findOne({ email })
      .select("email password provider isVerified")
      .lean();
    if (!existingUser)
      throw new AppError(
        "Invalid credentials , please check your email or password",
      );

    if (existingUser.provider !== "local")
      throw new AppError(
        "Invalid credentials , please use your google account to login",
      );

    if (!existingUser.isVerified)
      throw new AppError(
        "Your account is not verified , please check your email to verify your account",
      );

    const isPasswordValid = await verifyPassword(
      password,
      existingUser.password,
    );

    if (!isPasswordValid)
      throw new AppError(
        "Invalid credentials , please check your email or password",
      );

    // TODO : generate token and add to cookies will be here . (accessToken and refreshToken)

    c.json({
      success: true,
      message: "User logged in successfully",
    });
  } catch (error) {
    if (error instanceof AppError)
      return c.json({ success: false, message: error.message });

    return c.json({ success: false, message: "Internal server error" });
  }
};
