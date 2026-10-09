import { Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const handleCopy = async (str: string,setCopy:(copy:boolean)=>void) => {
    await navigator.clipboard.writeText(str);
    setCopy(false);

    setTimeout(() => {
      setCopy(true);
    }, 2000);
  };

export default function CopyText({
  label,
  text,
  copy,
  setCopy
}: {
  label: string;
  text: string;
  copy: boolean;
  setCopy:(copy:boolean)=>void;
}) {
  
  return (
    <div className="flex items-center gap-2">
      <p>
        {label}:{" "}
        <span className="text-foreground/50">
          {text?.slice(0, 8)}....
          {text?.slice(-8)}
        </span>
      </p>
      <button
        type="button"
        className="flex items-center outline-0"
        onClick={() => handleCopy(text,setCopy)}
      >
        <AnimatePresence mode="wait">
          {copy === true ? (
            <motion.span
              key="copy"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              className="inline-block"
            >
              <Copy className="w-5 h-5 text-foreground hover:text-primary transition-all duration-300 ease-in-out" />
            </motion.span>
          ) : (
            <motion.span
              key="check"
              initial={{ opacity: 0, scale: "95%" }}
              animate={{ opacity: 1, scale: "105%" }}
              className="inline-block"
            >
              <Check className="w-5 h-5 text-primary" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
