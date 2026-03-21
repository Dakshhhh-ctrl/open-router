import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenRouter",
  description: "Chat with 400+ AI models via OpenRouter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full overflow-hidden bg-gray-950">{children}</body>
    </html>
  );
}
