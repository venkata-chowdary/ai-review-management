"use client";

import { useState } from "react";
import { Menu, PillContent, pillTriggerClass } from "@/components/ui/Menu";

const ranges = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

// Mock data does not change with the range yet; Phase 2 passes it to queries.
export function DateRange({ align }: { align?: "start" | "end" }) {
  const [value, setValue] = useState("30");
  return (
    <Menu
      label="Date range"
      value={value}
      options={ranges}
      onChange={setValue}
      align={align}
      triggerClassName={pillTriggerClass}
      trigger={(current) => <PillContent icon="calendar">{current?.label}</PillContent>}
    />
  );
}
