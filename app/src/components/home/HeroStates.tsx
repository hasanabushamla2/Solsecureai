import { Cpu, ShieldCheck, Terminal, Layers } from "lucide-react";

export default function HeroState(){
    const style = "flex items-center bg-foreground/40 gap-3 text-white backdrop-blur-sm p-2 rounded-xl w-full border-border border-r";
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-10">
            <div className={style}>
                <Cpu aria-hidden="true" size={28}/>
                <div>
                    <h3 className="font-semibold">LLM</h3>
                    <p className="font-mono text-white/50">Guardrails Active</p>
                </div>
            </div>
            <div className={"flex items-center backdrop-blur-md p-2 bg-foreground/40 rounded-xl gap-3 w-full text-white border-r border-border"}>
                <ShieldCheck aria-hidden="true" size={28}/>
                <div>
                    <h3 className="font-semibold">ANCHOR</h3>
                    <p className="font-mono text-white/50">Secure Program</p>
                </div>
            </div>
            <div className={style}>
                <Terminal aria-hidden="true" size={28}/>
                <div>
                    <h3 className="font-semibold">ANTI</h3>
                    <p className="font-mono text-white/50">Prompt Injection</p>
                </div>
            </div>
            <div className={"flex items-center backdrop-blur-md p-2  bg-foreground/40 rounded-xl border-r border-border gap-3 w-full text-white "}>
                <Layers aria-hidden="true" size={28}/>
                <div>
                    <h3 className="font-semibold">ON-CHAIN</h3>
                    <p className="font-mono text-white/50">Verified Rewards</p>
                </div>
            </div>
        </div>
    )
}