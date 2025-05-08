import { Metadata } from "next";
import "../app/globals.css";
import { AuthProvider } from "@/contexts/auth.context";

export const metadata: Metadata = {
  title: "Gestão de Resíduos - SINIR",
  description: "Ferramenta de análise para gestão de resíduos integrada ao SINIR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <AuthProvider>
        <html lang="pt-BR">
          <body
            className={`antialiased`}
          >
            {children}
          </body>
        </html>
      </AuthProvider>
  );
}
