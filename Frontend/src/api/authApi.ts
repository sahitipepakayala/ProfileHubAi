import axiosInstance from "./axiosInstance";
import type { AuthUser } from "../types";

interface SignupPayload {
  role: "company" | "candidate";
  email: string;
  password: string;
  fullName?: string;       // candidate only
  companyName?: string;    // company only
  industry?: string;       // company only
}

interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post("/auth/signup", payload);
  return data;
};

export const login = async (
  role: "company" | "candidate",
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post("/auth/login", { role, email, password });
  return data;
};