// src/api/api.ts
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // change if deployed
});

// Example: upload file
export const uploadFile = (formData: FormData) => 
  API.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Example: analyze document
export const analyzeDocument = (fileId: string) =>
  API.get(`/analyze/${fileId}`);

// Example: chat with document
export const sendMessage = (fileId: string, message: string) =>
  API.post(`/chat/${fileId}`, { message });
