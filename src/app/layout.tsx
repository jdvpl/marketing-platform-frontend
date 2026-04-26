import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { ReduxProvider } from "@/lib/redux/ReduxProvider";
import Chatbot from "@/components/Chatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ContenixIA - Marketing inteligente, todo en uno",
  description: "Plataforma SaaS de marketing digital con IA generativa, gestion de redes sociales y analytics",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";
  const isDark = theme === "dark";

  return (
    <html lang="es" className={isDark ? "dark" : ""}>
      <body className={inter.className}>
        <ReduxProvider>
          {children}
          <Chatbot />
        </ReduxProvider>
      </body>
    </html>
  );
}
