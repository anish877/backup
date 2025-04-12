
// src/components/Providers.tsx
"use client";

import { HealthProvider } from '@/context/HealthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <HealthProvider>{children}</HealthProvider>;
}