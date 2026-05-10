import { createFileRoute } from "@tanstack/react-router";
import { ParentMyChildrenView } from "@/components/views/parent-my-children-view";

export const Route = createFileRoute("/my-children")({
  component: MyChildrenPage,
});

function MyChildrenPage() {
  return <ParentMyChildrenView />;
}
