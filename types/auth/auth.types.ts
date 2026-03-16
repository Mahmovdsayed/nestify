interface SignUpType {
  email: string;
  password: string;
  name: string;
}

interface SignInType {
  email: string;
  password: string;
}

interface ForgotPasswordType {
  email: string;
}

interface ResetPasswordType {
  password: string;
  confirmPassword: string;
}

interface VerifyEmailType {
  otp: string;
}

interface ResendOtpType {
  email: string;
}

export type {
  SignUpType,
  SignInType,
  ForgotPasswordType,
  ResetPasswordType,
  VerifyEmailType,
  ResendOtpType,
};
