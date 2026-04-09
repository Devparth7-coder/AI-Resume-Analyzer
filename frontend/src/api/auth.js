import apiClient from "./client";

export async function signupRequest(payload) {
  const { data } = await apiClient.post("/auth/signup", payload);
  return data;
}

export async function loginRequest(payload) {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
}

export async function getCurrentUserRequest() {
  const { data } = await apiClient.get("/auth/me");
  return data;
}
