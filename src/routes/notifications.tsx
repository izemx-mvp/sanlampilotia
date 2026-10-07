import { createFileRoute } from "@tanstack/react-router";
import { Shell, NotificationList } from "@/components/app/Shell";
import { Button, PageHeader } from "@/components/app/ui";
import { useStore } from "@/lib/store";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/notifications")({ head: pageHead("Notifications", "Alertes remontées par les Agents IA."), component: Notifications });

function Notifications() {
  const { setNotifs } = useStore();
  return (
    <Shell>
      <PageHeader title="Notifications" subtitle="Alertes remontées par vos Agents IA.">
        <Button size="sm" onClick={() => setNotifs((n) => n.map((x) => ({ ...x, read: true })))}>Tout marquer comme lu</Button>
      </PageHeader>
      <div className="max-w-3xl"><NotificationList /></div>
    </Shell>
  );
}
