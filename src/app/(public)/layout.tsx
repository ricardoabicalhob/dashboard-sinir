'use client'
import { Toaster } from "@/components/ui/toaster";
import "../globals.css"
import { QueryClientProvider } from "react-query";
import { queryClient } from "@/services/queryClient";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-[#333] text-white">
          { children }
          <Toaster />
      </div>
    </QueryClientProvider>
  )
}