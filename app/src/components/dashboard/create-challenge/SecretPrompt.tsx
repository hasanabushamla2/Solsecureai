import { useRef } from "react";

export default function SystemPromptField({
  sysProm,
  setSysProm,
  placeholder
}: {
  sysProm: string;
  setSysProm: React.Dispatch<React.SetStateAction<string>>;
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  

  return (
    <div className="flex relative mb-2 items-start gap-3 w-full border border-border rounded-xl px-3 py-2 bg-background focus-within:border-blue-500 transition-colors">
      <div className="text-foreground ml-1">
        <svg
          xmlns="http://w3.org"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25M19.5 5.25l-3.5 3.5m-3.5-3.5 3.5 3.5m-3.5 3.5 3.5-3.5M10.5 5.25 7 8.75m0 0-3.5-3.5M7 8.75v7.875"
          />
        </svg>
      </div>

      <div className="relative w-full">
        <textarea
        id="system_prompt"
        ref={textareaRef}
        onInput={handleInput}
        value={sysProm}
        onChange={(e) => setSysProm(e.target.value)}
        rows={1}
        placeholder={placeholder?placeholder:"•••••••••••• (Leave blank to keep current)"}
        className="w-full peer transition-all duration-200 focus:text-md focus:scale-105 px-1 bg-transparent text-sm text-foreground placeholder-gray-400 outline-none resize-none min-h-[24px] align-top"
      />
      <label
        htmlFor="system_prompt"
        className="absolute -left-10 -top-5 px-0.5 bg-background text-gray-400 text-sm transition-all duration-200 
                peer-focus:text-blue-500
              "
      >System Prompt</label>
      </div>
    </div>
  );
}
