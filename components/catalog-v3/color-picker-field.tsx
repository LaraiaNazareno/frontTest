"use client"

import { Input } from "@/components/ui/input"

interface ColorPickerFieldProps {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

export function ColorPickerField({ label, value, placeholder, onChange }: ColorPickerFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
        <label className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border shadow-sm">
          <span className="absolute inset-1 rounded-full" style={{ backgroundColor: value }} />
          <input
            type="color"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-full w-full cursor-pointer opacity-0"
          />
        </label>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="font-mono uppercase tracking-wide"
        />
      </div>
    </div>
  )
}
