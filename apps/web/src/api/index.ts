import { QueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { message } from "antd";

export const queryClient = new QueryClient();

export const api = axios.create({
  baseURL: process.env.REACT_APP_PUBLIC_API_URL,
});

const getResponseMessage = (message: unknown) => {
  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message) && typeof message[0] === "string") {
    return message[0];
  }

  return null;
};

const getApiErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const response = error.response;

    if (response) {
      if (response.status >= 500) {
        return "The system is having trouble right now. Please try again in a moment.";
      }

      if (response.data) {
        const responseMessage = getResponseMessage(response.data.message);

        if (responseMessage) {
          return responseMessage;
        }
      }

      return "We could not complete the request. Please try again.";
    }

    return "We could not reach the system. Please check your connection and try again.";
  }

  return "Something went wrong. Please try again.";
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    message.error(getApiErrorMessage(error));

    return Promise.reject(error);
  },
);
