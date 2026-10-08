import type { Metadata } from "next";
import "@fontsource/crimson-pro/400.css";
import "@fontsource/crimson-pro/600.css";
import "@fontsource/crimson-pro/700.css";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "./globals.css";
import { DemoProvider } from "@/components/demo-provider";

export const metadata: Metadata = {
  title: "UniCouncil Scheduler · EIU",
  description: "Bản xem trước giao diện đăng ký và phê duyệt lịch họp của lãnh đạo EIU"
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="vi">
      <body>
        <a className="skip-link" href="#main-content">Đi tới nội dung chính / Skip to content</a>
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
