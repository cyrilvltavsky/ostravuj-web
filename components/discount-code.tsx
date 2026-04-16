"use client";

import { useState } from "react";

type DiscountCodeProps = {
  code: string;
};

export function DiscountCode({ code }: DiscountCodeProps) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  async function copy() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const ta = document.createElement("textarea");
        ta.value = code;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }

  const copied = state === "copied";

  return (
    <div className="rounded-card-lg border border-peach bg-gradient-to-br from-[#fff7ed] to-peach p-7">
      <h4 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-peach-deep">
        Slevový kód
      </h4>
      <button
        type="button"
        onClick={copy}
        className={`flex w-full items-center justify-between rounded-xl border-2 px-5 py-4 text-lg font-bold tracking-wider transition ${
          copied
            ? "border-solid border-mint-strong bg-mint text-mint-deep"
            : "border-dashed border-peach-strong bg-white text-peach-deep hover:-translate-y-0.5 hover:bg-[#fff7ed]"
        }`}
      >
        <span>{code}</span>
        <span className={`text-[11px] font-bold tracking-wider ${copied ? "text-mint-deep" : "text-peach-deep"}`}>
          {copied ? "✓ ZKOPÍROVÁNO" : state === "error" ? "CHYBA" : "KOPÍROVAT"}
        </span>
      </button>
      <p className="mt-2.5 text-xs text-peach-deep">
        Klikni pro zkopírování do schránky
      </p>
    </div>
  );
}
