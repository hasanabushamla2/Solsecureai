"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  Search,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import ThemeToggle from "../layout/ThemeToggle";
import {
  getNotification,
  getNotificationContent,
  getProfile,
  postNotification,
} from "@/lib/dashboard/api";
import { useSearch } from "@/hooks/useSearch";
import { socket } from "@/lib/socket";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Notification {
  id: string;
  challenge_pda: string;
  wallet_address: string;
  content: {
    message: string;
  };
  created_at: string;
}

export default function Header() {
  const { publicKey, wallet, connect, select } = useWallet();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openSearch, setOpenSearch] = useState(false);
  const [notification, setNotification] = useState(false);
  const [notfContent, setNotfContent] = useState<Notification[]>([]);
  const { searchQuery, setSearchQuery } = useSearch();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const handleFocus = () => {
    inputRef.current?.focus();
  };

  const [isMac, setIsMac] = useState(false);
  const queryClient = useQueryClient();

  const getProfileRes = async () => {
    const rs = await getProfile();
    return rs.result.username;
  };

  const getNotf = async () => {
    try {
      const getRes = await getNotificationContent();
      return getRes.result;
    } catch (err) {
      console.error(err);
      return [];
    }
  };
  const getNotfCount = async () => {
    try {
      const getRes = await getNotification();
      return getRes.result[0].count;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const {
    data: notificationCash = [],
    isLoading,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: ["notification"],
    queryFn: getNotf,
  });
  const {
    data: notification_count = [],
    isLoading: isLoadingCount,
    refetch: refetchCount,
  } = useQuery({
    queryKey: ["notification_count"],
    queryFn: getNotfCount,
  });

  const {
    data: profile = [],
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfileRes,
  });
  const handleNotf = async () => {
    try {
      setTimeout(async () => {
        if (notification_count > 0) {
          const res = await postNotification();
        }
        setUnreadCount(0);
      }, 500);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notification"] }),
        queryClient.invalidateQueries({ queryKey: ["notification_count"] }),
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket.on("dashboard:update", refetch);
    socket.on("dashboard:update", refetchCount);
    socket.on("dashboard:update", refetchProfile);

    const platform = window.navigator.userAgent.toLowerCase();
    if (
      platform.includes("mac") ||
      platform.includes("iphone") ||
      platform.includes("ipad")
    ) {
      setIsMac(true);
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      socket.off("dashboard:update");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [socket]);

  useEffect(() => {
    if (!publicKey && wallet) {
      const tryconnect = async () => {
        try {
          await select(wallet.adapter.name);
          await connect();
        } catch (err) {
          console.error("Error to connection wallet");
        }
      };
      tryconnect();
    }
  }, [publicKey, connect, select, wallet]);

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    router.replace("/");
  };

  const toggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("sidebar") === "true") {
      params.delete("sidebar");
    } else {
      params.set("sidebar", "true");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  return (
    <>
      <header className="flex bg-background justify-between items-center py-2 px-5 ">
        <div className="flex flex-row gap-2.5 items-center">
          <button className="flex lg:hidden" onClick={toggle}>
            <Menu />
          </button>
          <div className="h-10 bg-foreground/10 text-foreground/60 flex items-center px-4 rounded-3xl">
            <div>
              <button
                className="flex items-center"
                onClick={() => {
                  if (window.innerWidth <= 768) {
                    setOpenSearch(!openSearch);
                  }

                  handleFocus();
                }}
              >
                <Search />
              </button>
            </div>

            <div
              className={`z-99 ${openSearch ? "flex justify-between absolute top-15 p-4 rounded-full bg-zinc-200 min-w-11/12 left-1/2 -translate-x-1/2" : "hidden md:flex"}`}
            >
              <input
                ref={inputRef}
                type="search"
                enterKeyHint="search"
                placeholder="search..."
                className={`focus:outline-0 text-foreground z-99`}
                spellCheck="false"
                autoCorrect="off"
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={() => {
                  setSearchQuery("");
                  setOpenSearch(false);
                }}
                className="text-black flex md:hidden items-center"
              >
                <X size={20} />
              </button>
            </div>

            <button
              className="flex items-center hidden lg:flex"
              onClick={handleFocus}
            >
              {isMac ? (
                <>
                  <span className="text-xs font-semibold leading-none">⌘ </span>
                </>
              ) : (
                <span className="text-xs font-semibold leading-none">
                  Ctrl+
                </span>
              )}{" "}
              <span className="leading-none text-sm">K</span>
            </button>
          </div>
        </div>
        <div
          className="flex flex-row gap-2 items-center"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="text-foreground flex items-center">
            <ThemeToggle />
          </div>
          <div className="relative">
            {notification_count > 0 && (
              <span className="absolute right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {notification_count}
              </span>
            )}

            <button
              onClick={() => {
                setNotification(!notification);
                refetch();
                handleNotf();
              }}
              className=" text-foreground hover:text-primary/70 transition-all duration-300 ease-in-out border-border border-r p-2"
            >
              <Bell className="font-bold" size={24} />
            </button>
            {notification && (
              <div className="absolute bg-background overflow-y-auto max-h-[300px] border-border shadow-2xl border p-2 rounded-xl z-99 text-foreground w-70 -right-5 mt-2">
                {notificationCash.length === 0 && (
                  <div className="text-foreground/50">No notifications yet</div>
                )}
                {notificationCash &&
                  notificationCash?.map((e, index) => {
                    return (
                      <div
                        key={index}
                        className={`flex flex-col justify-between py-2`}
                      >
                        <p className="font-bold flex items-start">
                          {e.content.message || ""}
                        </p>
                        <p className="flex items-end text-foreground/50">
                          {formatDistanceToNow(new Date(e.created_at), {
                            addSuffix: true,
                          }) || ""}
                        </p>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
          <div className="cursor-default capitalize select-none text-xl font-bold text-white w-10 h-10 flex justify-center items-center rounded-full bg-gradient-to-b from-blue-600 to-white/70">
            {profile.slice(0, 1)}
          </div>
          <div className="justify-center relative hidden md:flex flex-col cursor-default select-none">
            <h3 className="font-bold text-foreground">{profile} </h3>
            <p className="text-foreground/40">
              {publicKey?.toBase58().slice(0, 4)}....
            </p>
          </div>
          <button
            onMouseEnter={() => setOpen(true)}
            className={`text-foreground hover:text-primary/70 transition-all duration-300 ease-in-out`}
          >
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="inline-block"
            >
              <ChevronDown className={`${open && "text-primary"}`} />
            </motion.span>
          </button>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onMouseLeave={() => setOpen(false)}
              className="bg-primary-foreground border-border border absolute text-2xl right-0 mr-2 top-15 -mt-2 z-99 text-primary-foreground p-4 rounded-2xl"
            >
              <button
                onClick={() => {
                  handleLogout();
                }}
                className="flex text-foreground items-center gap-2 text-sm hover:text-red-500 transition-all duration-300 ease-in-out"
              >
                <LogOut /> Logout
              </button>
            </motion.div>
          )}
        </div>
      </header>
    </>
  );
}
