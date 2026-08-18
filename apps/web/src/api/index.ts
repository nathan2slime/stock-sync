import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

export const queryClient = new QueryClient();

export const api = axios.create({
  baseURL: process.env.REACT_APP_PUBLIC_API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: Handle errors globally, e.g., show a notification or redirect to an error page
    return Promise.reject(error);
  },
);
