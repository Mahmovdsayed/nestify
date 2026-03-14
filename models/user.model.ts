import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin";
  address?: [
    {
      label: string;
      street: string;
      city: string;
      country: string;
      postalCode: string;
      phone: string;
    },
  ];
  otp: string;
  otpExpiry: Date;
  isVerified: boolean;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  provider: "local" | "google";
  avatar?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, lowercase: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    address: [
      {
        label: { type: String },
        street: { type: String },
        city: { type: String },
        country: { type: String },
        postalCode: { type: String },
        phone: { type: String },
      },
    ],
    otp: { type: String },
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String },
    resetPasswordExpires: { type: Date },
    resetPasswordToken: { type: String },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    avatar: {
      url: { type: String },
      publicId: { type: String },
    },
  },
  { timestamps: true, versionKey: false },
);

// improve 
userSchema.index({ email: 1 });


const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
