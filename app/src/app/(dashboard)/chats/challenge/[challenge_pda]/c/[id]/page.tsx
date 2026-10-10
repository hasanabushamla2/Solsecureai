"use client";
import { useParams } from "next/navigation";
import { SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getMessages } from "@/lib/dashboard/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { socket } from "@/lib/socket";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import ComponentLoading from "@/components/layout/Loading";

interface Message {
  id: string;
  chat_session_id: string;
  role: string;
  content: string;
  created_at: string;
}

export default function page() {
  const messageRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState<string>("");
  const sessionId = params.id;
  const ch = params.challenge_pda;
  const queryClient = useQueryClient();
  const [error, setError] = useState();

  const streamingref = useRef("");
  const [streamingText, setStreamingText] = useState("");
  const [loadingThink, setLoadingThink] = useState(false);
  const send = useRef<boolean>(false);

  const fetchMessages = async () => {
    try {
      const res = await getMessages(
        sessionId?.toString() || "",
        ch?.toString() || "",
      );
      return res.result;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const {
    data: messagesCash = [],
    isLoading,
    refetch,
  } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: fetchMessages,
  });

  const scrollToBottom = () => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const onConnectError = (error: Error) => {
      console.error("Socket connection failed:", error.message);
    };
    const onConnect = () => {
      socket.emit("chat:join", sessionId);
      refetch();
    };
    const onMessage = async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["messages"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboardStats"] }),
      ]);
      refetch();
    };
    const onError = async (error: any) => {
      console.error("Failed send to AI");
      setLoading(false);
      setLoadingThink(false);
      send.current = false;
      streamingref.current = "";
      setError(error);
      refetch();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["messages"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboardStats"] }),
      ]);
    };
    const onChunk = async (chunk: { text: string }) => {
      setLoading(true);
      streamingref.current += chunk.text;
      setStreamingText(streamingref.current);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["messages"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboardStats"] }),
      ]);
    };
    const onDone = async () => {
      refetch();
      streamingref.current = "";
      send.current = false;
      setLoadingThink(false);
      setLoading(false);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["messages"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboardStats"] }),
      ]);
    };

    socket.on("connect_error", onConnectError);
    socket.on("connect", onConnect);
    socket.on("chat:message", onMessage);
    socket.on("chat:error", onError);
    socket.on("chat:chunk", onChunk);
    socket.on("chat:done", onDone);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect_error", onConnectError);
      socket.off("connect", onConnect);
      socket.off("chat:message", onMessage);
      socket.off("chat:error", onError);
      socket.off("chat:chunk", onChunk);
      socket.off("chat:done", onDone);
    };
  }, [sessionId]);

  useEffect(() => {
    const t = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(t);
  }, [messagesCash, streamingText, loadingThink]);

  const handleSend = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !socket) return;
    if (send.current) return;
    send.current = true;

    const payload = {
      chatSessionId: sessionId,
      content: messageText,
    };

    socket.emit("chat:send", payload);
    setMessageText("");
    streamingref.current = "";
    setStreamingText("");
    setLoadingThink(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["messages"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] }),
    ]);
  };
  if (isLoading) {
    return <ComponentLoading />;
  }
  return (
    <div className="flex items-center justify-center px-2 ">
      <div className="flex justify-center relative border-border/50 overflow-y-auto border-2 flex-col bg-muted/2 w-full md:w-1/2 h-[calc(100vh-90px)] mt-2 rounded-3xl shadow-[0px_0px_20px_15px_rgba(100,100,100,0.15)] z-50">
        <p className="text-foreground text-center font-bold py-2">Chat</p>
        <div className="h-11/12 p-5 overflow-x-hidden [mask-composite:intersect] [mask-image:linear-gradient(to_bottom,transparent_0%,white_48px,white_100%),linear-gradient(to_top,transparent_0%,white_48px,white_100%)] text-foreground flex flex-col w-full gap-2 overflow-y-auto">
          <AnimatePresence>
            {messagesCash &&
              messagesCash?.map((m, index) => {
                if (m.role === "user") {
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.55 }}
                      dir="auto"
                      className="text-white break-words whitespace-pre-wrap"
                    >
                      <div className="prose dark:prose-invert max-w-none bg-primary rounded-xl px-2 w-fit">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    </motion.div>
                  );
                } else {
                  return (
                    <div
                      key={index}
                      dir="auto"
                      className="break-words whitespace-pre-wrap rounded-xl"
                    >
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    </div>
                  );
                }
              })}
          </AnimatePresence>
          <AnimatePresence>
            {loading && (
              <>
                {streamingText && (
                  <motion.div className="items-end">
                    <motion.p
                      dir="auto"
                      className="break-words whitespace-pre-wrap"
                    >
                      {Array.from(streamingText).map((char, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.33,
                            ease: "easeOut",
                          }}
                        >
                          {char}
                        </motion.span>
                      ))}
                    </motion.p>
                    <span className="typing-dots">
                      <i />
                      <i />
                      <i />
                    </span>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
          {loadingThink && (
            <div className="flex items-center w-full space-x-1.5 bg-gray-200 dark:bg-zinc-800 p-2 rounded-2xl max-w-fit ml-2 my-2">
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>

              <span>Failed to send. Please try again.</span>
            </div>
          )}
          <div ref={messageRef} />
        </div>

        <div className="p-2">
          <div className="overflow-hidden h-full flex flex-row relative bg-muted w-full rounded-2xl min-h-30">
            <form
              className="h-full grid grid-cols-12 w-full"
              onSubmit={(e) => {
                handleSend(e);
              }}
            >
              <textarea
                onChange={(e) => setMessageText(e.target.value)}
                className="h-full col-span-11 mx-3 mt-1 resize-none outline-0"
                dir="auto"
                value={messageText}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              ></textarea>
              <div className="flex items-center">
                <button
                  type="submit"
                  disabled={send.current}
                  className={` ${send.current ? "bg-gray-500" : "bg-foreground"} over:bg-foreground/80 text-primary-foreground p-2 rounded-full transition-colors`}
                >
                  <SendHorizontal size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
