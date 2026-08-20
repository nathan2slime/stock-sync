import { queryOptions } from "@tanstack/react-query";
import { api } from "~/api";

export const healthQueryFn = async () => {
  const response = await api.get("/health");

  return response.data;
};

export const healthQueryOptions = () =>
  queryOptions({
    queryFn: () => healthQueryFn(),
    retry: false,
    queryKey: ["health"] as const,
  });
