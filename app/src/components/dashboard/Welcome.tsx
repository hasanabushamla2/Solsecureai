import Link from "next/link";


export default function Welcome({username}:{username:string}){
    
    return (
        <div className="flex items-center justify-between flex-col md:flex-row gap-2">
            <div className="flex flex-col gap-2 text-foreground/50">
                <p className="text-lg">Welcome back,</p>
                <h1 className="text-4xl font-bold text-foreground">{username}</h1>
                <p className="md:text-md">Build, Challenge,<br className="md:hidden"/> and grow with AI on Solana</p>
            </div>
            <button className="bg-primary text-white py-2 px-8 rounded-2xl group relative hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out">
                <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg rounded-full group-hover:scale-95"/>
                <Link href={'/create-challenge'} className="relative z-10">Create Challenge</Link>
            </button>
        </div>
    )
}