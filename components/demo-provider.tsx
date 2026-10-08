"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { createMockRequests, type Locale, type MeetingRequest, type Role } from "@/lib/demo-data";

type DemoContextValue = {
  role: Role;
  setRole: (value: Role) => void;
  locale: Locale;
  setLocale: (value: Locale) => void;
  requests: MeetingRequest[];
  setRequests: React.Dispatch<React.SetStateAction<MeetingRequest[]>>;
  toast: string;
  setToast: (value: string) => void;
};
const DemoContext = createContext<DemoContextValue | undefined>(undefined);

export function DemoProvider({children}: {children: React.ReactNode}) {
  const [role,setRole] = useState<Role>("REQUESTER");
  const [locale,setLocale] = useState<Locale>("vi");
  const [requests,setRequests] = useState<MeetingRequest[]>(createMockRequests);
  const [toast,setToast] = useState("");
  const state = useMemo(()=>({role,setRole,locale,setLocale,requests,setRequests,toast,setToast}),[role,locale,requests,toast]);
  return <DemoContext.Provider value={state}>{children}</DemoContext.Provider>;
}
export function useDemo() {
  const context=useContext(DemoContext);
  if(!context) throw new Error("useDemo must be used within DemoProvider");
  return context;
}
