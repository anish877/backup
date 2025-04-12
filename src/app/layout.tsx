"use client";

import { CustomToaster } from "@/components/CustomToast";
import "./globals.css"
import NavBar from '@/components/NavBar';
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavBar/>
            {children}
        <CustomToaster/>
        </AuthProvider>
      </body>
    </html>
  );
}