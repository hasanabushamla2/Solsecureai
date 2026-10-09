"use client";
import {
  LayoutDashboard,
  Trophy,
  PlusCircle,
  ListTodo,
  MessageSquare,
  Wallet,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Menu() {
  const pathname = usePathname();
  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={28} />,
      path: "/dashboard",
    },
    {
      name: "Challenges",
      icon: <Trophy size={28} />,
      path: "/challenges",
    },
    {
      name: "Create Challenge",
      icon: <PlusCircle size={28} />,
      path: "/create-challenge",
    },
    {
      name: "My Challenges",
      icon: <ListTodo size={28} />,
      path: "/my-challenges",
    },
    {
      name: "Challenge participants",
      icon: <User size={28} />,
      path: "/challenge-participants",
    },
    {
      name: "Chat Sessions",
      icon: <MessageSquare size={28} />,
      path: "/chats",
    },
    {
      name: "Wallet & Billing",
      icon: <Wallet size={28} />,
      path: "/billing",
    },
    {
      name: "Leaderboard",
      icon: <Trophy size={28} />,
      path: "/leaderboard",
    },
    {
      name: "Settings",
      icon: <Settings size={28} />,
      path: "/settings",
    },
  ];
  return (
    <div className="flex flex-col gap-3">
      {menuItems.map((e) => (
        <div key={`${e.name}`} className={`${pathname.startsWith(`${e.path}`) && "border-l-5 border-primary"} overflow-hidden rounded-xl py-2 bg-gradient-to-r from-primary/10 to-transparent`}>
          <Link
            
            className={`flex px-5 py-1 group items-center transition-all duration-300 ease-in-out ${pathname!==e.path&&"hover:translate-x-2"}`}
            href={`${e.path}`}
          >
            <span
              className={`transition-all duration-300 ease-in-out group-hover:text-primary ${pathname === e.path ? "text-primary" : "text-foreground"} mr-2`}
            >
              {e.icon}
            </span>
            <span className="transition-all duration-300 ease-in-out text-lg text-foreground group-hover:text-primary">{e.name}</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
