"use server";

import { axiosInstance } from "@/helpers/axios";
import { SignUpType } from "@/types/auth/auth.types";

export const signUpService = async (payload: SignUpType) => {
  try {
    const { data } = await axiosInstance.post("/auth/signup", payload);
    return data;
  } catch (error) {
    throw error;
  }
};
