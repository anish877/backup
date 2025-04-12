"use client";

import { CustomToaster } from "@/components/CustomToast";
import "./globals.css"
import NavBar from '@/components/NavBar';
import { AuthProvider } from "@/context/AuthContext";
import { DailyLogProvider } from "@/context/DailyLogContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DailyLogProvider>
          <NavBar/>
            {children}
        <CustomToaster/>
          </DailyLogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}