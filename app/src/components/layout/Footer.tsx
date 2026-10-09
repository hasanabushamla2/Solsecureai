"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function Footer() {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-10 md:flex-row justify-around border-t border-border py-5 px-4">
      <div className="flex flex-col">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline text-foreground"
          aria-current={pathname === "/" ? "page" : undefined}
        >
          <Image src="/icon.png" width={40} height={40} alt="" />
          <h2 className="text-2xl font-black tracking-tight m-0">
            SolSecureAI
          </h2>
        </Link>
        <div className="flex flex-row gap-5 mt-5">
          <Link
            href="https://github.com/hasanabushamla2"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-all group"
          >
            <svg
              className="w-5 h-5 fill-current group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            <span className="text-[10px]">GitHub</span>
          </Link>
          <Link
            href="https://x.com/hasanabushamla"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-all group"
          >
            <svg
              className="w-5 h-5 fill-current group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-[10px]">Twitter</span>
          </Link>
          <Link
            href="https://discordapp.com/users/1535746247581896786"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-indigo-400 transition-all group"
          >
            <svg
              className="w-5 h-5 fill-current group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.298 12.298 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
            </svg>
            <span className="text-[10px]">Discord</span>
          </Link>
        </div>
      </div>
      <div className="flex-col flex bg-background text-foreground/50">
        <Link href={'/terms-of-service'} className=" hover:text-foreground transition-all duration-300 ease-in-out">Terms of Service</Link>
        <Link href={'/privacy-policy'} className=" hover:text-foreground transition-all duration-300 ease-in-out">Privacy Policy</Link>
        <Link href={'/ai-disclaimer'} className=" hover:text-foreground transition-all duration-300 ease-in-out">AI Disclaimer</Link>
        <Link href={'/faq'} className=" hover:text-foreground transition-all duration-300 ease-in-out">FAQ</Link>
        
      </div>
      <div className="flex items-center gap-2 w-fit h-fit bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">Status: Devnet Live</span>
        </div>
    </div>
  );
}
