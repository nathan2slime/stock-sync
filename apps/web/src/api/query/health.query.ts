import { api } from "~/api";

export const healthQueryFn = async () => {
  const response = await api.get("/health");

  return response;
};
