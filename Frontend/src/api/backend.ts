import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000"; // Flask backend

export const uploadPDF = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${BASE_URL}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data; // summary, clauses, risks, context
};

export const askQuestion = async (question: string, context: string) => {
  const response = await axios.post(`${BASE_URL}/ask`, { question, context });
  return response.data; // answer + confidence
};
