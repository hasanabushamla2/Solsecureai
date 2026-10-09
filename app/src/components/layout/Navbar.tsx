import { usePathname } from "next/navigation";
import Link from "next/link"

export default function Navbar(){
    const pathname = usePathname();
    const styleLink = "hover:text-primary/90 text-white transition-all duration-500 ease-out"
    return (
        <nav className={`gap-5 hidden lg:flex`}>
            <Link href="/p/challenges" className={styleLink} aria-current={pathname === "/p/challenges" ? "page" : undefined}>
                Challenges
            </Link>
            <Link href="/how-it-works" className={styleLink} aria-current={pathname === "/how-it-works" ? "page" : undefined}>
                How it works
            </Link>
            <Link href="/p/leaderboard" className={styleLink} aria-current={pathname === "/p/leaderboard" ? "page" : undefined}>
                Leaderboard
            </Link>
            <Link href="/docs" className={styleLink} aria-current={pathname === "/docs" ? "page" : undefined}>
                Docs
            </Link>
        </nav>
    )
}