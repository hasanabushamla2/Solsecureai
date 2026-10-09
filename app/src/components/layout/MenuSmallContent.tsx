"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MenuSmallContent({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const pathname = usePathname();
  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const link = [
    { title: "Challenges", link: "p/challenges" },
    { title: "How it works", link: "how-it-works" },
    { title: "Leaderboard", link: "p/leaderboard" },
    { title: "Docs", link: "docs" },
  ];
  return (
    <motion.nav
      inert={!open}
      id="mobile-navigation"
      aria-label="Mobile navigation"
      aria-hidden={!open}
      variants={container}
      initial="hidden"
      animate={open ? "visible" : "hidden"}
      className="flex flex-col gap-10  h-screen bg-background"
    >
      {link.map((l) => (
        <motion.div
          key={l.link}
          variants={item}
          className="text-5xl ml-4"
          aria-current={pathname === `/${l.link}` ? "page" : undefined}
          onClick={() => setOpen(!open)}
        >
          <Link href={`/${l.link}`}>{l.title}</Link>
        </motion.div>
      ))}
    </motion.nav>
  );
}
