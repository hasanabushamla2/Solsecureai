import { Challenge } from "@/types/challenge";
import { Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function CopyTextCard({
  copy,
  challenge,
  setCopy,
  content
}: {
  copy: string;
  challenge?: Challenge;
  setCopy: (copy: string) => void;
  content?:string;
}) {
  const handleCopy = async (str: string) => {
    setCopy(str);
    await navigator.clipboard.writeText(str);

    setTimeout(() => {
      setCopy("");
    }, 2000);
  };
  return (
    <AnimatePresence mode="wait">
      <motion.button
        onClick={() => {
          handleCopy(challenge ? challenge.challenge_pda : content ||"");
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.55 }}
      >
        {copy !== (challenge ? challenge.challenge_pda : content ||"") ? (
          <motion.span
            key="copy"
            initial={{ opacity: 0, scale: "95%" }}
            animate={{ opacity: 1, scale: "100%" }}
            exit={{ opacity: 0, scale: "95%" }}
            className="inline-block"
          >
            <Copy className="w-3.5 h-3.5 text-foreground hover:text-primary transition-all duration-300 ease-in-out" />
          </motion.span>
        ) : (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: "95%" }}
            animate={{ opacity: 1, scale: "100%" }}
            exit={{ opacity: 0, scale: "95%" }}
            className="inline-block"
          >
            <Check className="w-3.5 h-3.5 text-primary" />
          </motion.span>
        )}
      </motion.button>
    </AnimatePresence>
  );
}
