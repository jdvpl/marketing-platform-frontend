import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/lib/redux/ReduxProvider";
import Chatbot from "@/components/Chatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ContenixIA - Marketing inteligente, todo en uno",
  description: "Plataforma SaaS de marketing digital con IA generativa, gestion de redes sociales y analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ReduxProvider>
          {children}
          <Chatbot />
        </ReduxProvider>
      </body>
    </html>
  );
}
