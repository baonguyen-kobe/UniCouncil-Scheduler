import type { Metadata } from "next";
import "@fontsource-variable/crimson-pro";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/be-vietnam-pro/vietnamese-400.css";
import "@fontsource/be-vietnam-pro/vietnamese-500.css";
import "@fontsource/be-vietnam-pro/vietnamese-600.css";
import "@fontsource/be-vietnam-pro/vietnamese-700.css";
import "./globals.css";
import { DemoProvider } from "@/components/demo-provider";
// Keep date-relative demo fixtures current instead of freezing them at build time.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "UniCouncil Scheduler · EIU",
  description:
    "EIU meeting request UI preview. Demo data only; no production integrations.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
