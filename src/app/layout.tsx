import { Metadata } from "next";
import "../app/globals.css";
import { AuthProvider } from "@/contexts/auth.context";

export const metadata: Metadata = {
  title: "Gestão de Resíduos - Integrada ao SINIR",
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
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            {children}
          </body>
        </html>
      </AuthProvider>
  );
}
