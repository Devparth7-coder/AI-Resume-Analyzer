import apiClient from "./client";

export async function analyzeResumeRequest(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post("/analyze-resume", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

export async function matchResumeRequest(payload) {
  const { data } = await apiClient.post("/match-resume", payload);
  return data;
}

export async function improveResumeRequest(payload) {
  const { data } = await apiClient.post("/improve-resume", payload);
  return data;
}
