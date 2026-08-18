import { useQuery } from "@tanstack/react-query";

import { healthQueryFn } from "~/api/query/health.query";

export const HealthCheck = () => {
  const { data, error } = useQuery({
    queryKey: ["health-check"],
    queryFn: healthQueryFn,
    refetchInterval: 5_000,
  });

  console.log(data, error);

  return (
    <div className="flex flex-col items-center justify-center gap-2"></div>
  );
};
