import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function PasswordField({ onChange }: any) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-2 relative">
      <Input
        type={show ? "text" : "password"}
        placeholder="••••••••"
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
      />

      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-2 top-2  text-gray-400 hover:text-white"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}