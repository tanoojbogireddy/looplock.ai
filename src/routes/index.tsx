import { createFileRoute } from "@tanstack/react-router";
import { RetentionEngine } from "@/components/RetentionEngine";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <RetentionEngine />;
}
