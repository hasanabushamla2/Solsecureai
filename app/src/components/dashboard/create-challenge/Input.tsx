import { LucideIcon, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function Input({
  input,
  setInput,
  Icon,
  placeholder,
  type,
  isPassword,
  min,
  requiredInput = true,
  label,
  ...props
}: {
  input: any;
  setInput?: React.Dispatch<React.SetStateAction<any>>;
  Icon?: LucideIcon;
  placeholder?: string;
  type?: string;
  isPassword?: boolean;
  min?: string;
  requiredInput?: boolean;
  label?: string;
} & React.ComponentPropsWithoutRef<"input">) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="border relative w-full focus-within:ring-1 focus-within:ring-blue-500 border-border/50 bg-primary-foreground/10 rounded-xl p-2 flex items-center gap-2">
      <span className="text-foreground px-2">{Icon && <Icon />}</span>
      <div className="w-full">
        <input
          id={input}
          value={input || ""}
          onChange={(e) => setInput!(e.target.value)}
          placeholder={placeholder}
          type={showPassword === true ? "text" : type}
          required={requiredInput === true}
          {...props}
        />
      </div>
      <label
        htmlFor={input}
        className="absolute left-3 bottom-8 px-0.5 bg-background text-gray-400 text-sm transition-all duration-200 
                peer-focus:text-blue-500
              "
      >
        {label}
      </label>
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="right-3 text-gray-400 hover:text-foreground transition-colors"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
}
