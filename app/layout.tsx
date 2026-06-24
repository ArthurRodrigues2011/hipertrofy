import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radar Treino Elite",
  description: "Dashboard de periodização de força e hipertrofia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
