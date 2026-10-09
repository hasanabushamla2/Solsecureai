'use client'
import Image from "next/image"
import Menu from "./Menu"
import { HelpCircle, ArrowRight, X } from 'lucide-react';
import Link from "next/link";
import { useSearchParams,useRouter, usePathname } from "next/navigation";

export default function SideBar(){
    const router = useRouter();
    const pathname = usePathname();
    const sideParam = useSearchParams();
    const open = sideParam.get('sidebar') === 'true';
    const toggle = ()=>{
        const params = new URLSearchParams(sideParam.toString())
        if(sideParam.get('sidebar') === 'true'){
            params.delete('sidebar')
        }
        else{
            params.set('sidebar','true')
        }
        router.push(`${pathname}?${params}`,{scroll:false})
    }
    return (
        <aside className={`${open? "flex":"hidden"} h-screen z-99 inset-y-0 bottom-0 shrink-0 top-0 sticky ${open?'w-full':'w-72'} gap-6 shrink-0 overflow-y-auto bg-background p-4 lg:flex flex-col justify-between`}>
            
            <div className="flex items-center gap-2 select-none justify-between">
                <div className="flex flex-row items-center gap-2">
                    <Image src={"/icon.png"} width={40} height={40} alt="SolSecureAI Image"/>
                <p className="text-foreground font-bold text-xl">
                    SolSecure<span className="text-transparent bg-clip-text bg-gradient-to-l from-background to-foreground pr-2">AI</span>
                </p>
                </div>
                <button className="font-bold flex lg:hidden" onClick={toggle}><X/></button>
            </div>
            <Menu/>
            <Link href={'/docs'} className="text-foreground bg-transparent p-4 border-border/10 border rounded-3xl flex items-center gap-3">
                <HelpCircle/>
                <div>
                    <p>Need help?</p>
                    <p className="flex items-center gap-2">Documentation <ArrowRight size={18}/></p>
                </div>
            </Link>
        </aside>
    )
}