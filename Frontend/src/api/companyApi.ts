import axiosInstance from "./axiosInstance";
import type { Company, CompanyDashboard } from "../types";

export const getMyProfile = async (): Promise<Company> => {
  const { data } = await axiosInstance.get("/company/me");
  return data;
};

export const updateMyProfile = async (
  updates: Partial<Pick<Company, "companyName" | "industry" | "description" | "website">>
): Promise<{ message: string; company: Company }> => {
  const { data } = await axiosInstance.put("/company/me", updates);
  return data;
};

export const getCompanyDashboard = async (): Promise<CompanyDashboard> => {
  const { data } = await axiosInstance.get("/company/me/dashboard");
  return data;
};
