import AppShell from "@/components/app-shell";
import RequestDetail from "@/components/request-detail";
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      {children}
      <RequestDetail />
    </AppShell>
  );
}
