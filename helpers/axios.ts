"use server";

import axios from "axios";

const clientUrl = process.env.CLIENT_URL;

export const axiosInstance = axios.create({
  baseURL: `${clientUrl}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.API_SECRET_KEY || "",
  },
});
