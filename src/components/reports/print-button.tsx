"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button className="premium-button print:hidden" onClick={() => window.print()}>
      <Printer className="h-5 w-5" />
      طباعة التقرير
    </button>
  );
}
