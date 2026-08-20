import { createFileRoute } from "@tanstack/react-router";

import { PendingOperations } from "~/pages/pending-operations";

export const Route = createFileRoute("/pending-operations")({
  component: PendingOperations,
});
