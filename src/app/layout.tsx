"use client";

import { CustomToaster } from "@/components/CustomToast";
import "./globals.css"
import NavBar from '@/components/NavBar';
import { AuthProvider } from "@/context/AuthContext";
import { WellnessProvider } from "@/context/WellnessContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
            <WellnessProvider>
            <NavBar/>
              {children}
        <CustomToaster/>
            </WellnessProvider>
        </AuthProvider>
      </body>
    </html>
  );
}