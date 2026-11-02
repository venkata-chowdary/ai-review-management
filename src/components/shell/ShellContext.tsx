"use client";

import { createContext, useContext, type ReactNode } from "react";

export type ShellBranch = { id: string; name: string; hasReviewLink: boolean };

type Shell = { branches: ShellBranch[] };

// The signed-in owner's branches, loaded on the server by DashboardShell, for the branch switchers.
const ShellContext = createContext<Shell>({ branches: [] });

export function ShellProvider({ branches, children }: { branches: ShellBranch[]; children: ReactNode }) {
  return <ShellContext.Provider value={{ branches }}>{children}</ShellContext.Provider>;
}

export function useShellBranches() {
  return useContext(ShellContext).branches;
}
