import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PasswordInput({ onChange }: any) {
  const [realValue, setRealValue] = useState("");
  const [displayValue, setDisplayValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const lastChar = newValue.slice(-1);

    setRealValue(newValue);

    // Show all dots except last char
    const masked =
      "•".repeat(newValue.length - 1) + lastChar;

    setDisplayValue(masked);

    // After 500ms → mask everything
    setTimeout(() => {
      setDisplayValue("•".repeat(newValue.length));
    }, 500);

    onChange(newValue);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-gray-200">Password</Label>

      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        autoComplete="off"
      />
    </div>
  );
}