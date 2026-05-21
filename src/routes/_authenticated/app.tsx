import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/components/Workspace";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [{ title: "Workspace — Retention Engine" }],
  }),
  component: () => <Workspace />,
});