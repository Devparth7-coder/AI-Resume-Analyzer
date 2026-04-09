import apiClient from "./client";

export async function getDashboardOverviewRequest() {
  const { data } = await apiClient.get("/dashboard/overview");
  return data;
}

export async function getDashboardHistoryRequest(limit = 20) {
  const { data } = await apiClient.get("/dashboard/history", {
    params: { limit },
  });
  return data;
}
