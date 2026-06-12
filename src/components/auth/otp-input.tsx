"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, length = 6, disabled }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  const focusInput = (index: number) => {
    inputsRef.current[index]?.focus();
    inputsRef.current[index]?.select();
  };

  const updateDigit = (index: number, digit: string) => {
    const next = digits.map((d, i) => (i === index ? digit : d.trim())).join("").slice(0, length);
    onChange(next.replace(/\s/g, ""));
    if (digit && index < length - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index]?.trim() && index > 0) {
      focusInput(index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) focusInput(index - 1);
    if (e.key === "ArrowRight" && index < length - 1) focusInput(index + 1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    focusInput(Math.min(pasted.length, length - 1));
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit.trim()}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          className={cn(
            "h-12 w-10 sm:h-14 sm:w-12 rounded-xl border border-stone-200 bg-white text-center text-lg font-semibold text-stone-900",
            "focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, "").slice(-1);
            updateDigit(index, next);
          }}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
