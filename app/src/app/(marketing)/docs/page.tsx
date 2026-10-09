import { Shield, Terminal, Code2, Lock } from "lucide-react";

export default function Docs() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-border pb-8 mb-12">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-6 h-6 text-foreground stroke-[1.5]" />
            <h1 className="text-2xl font-semibold tracking-tight">
              SolSecureAI
            </h1>
          </div>
          <p className="text-xl font-medium tracking-tight mb-2">
            Docs
          </p>
          <p className="text-foreground text-xs font-mono">
            Last Updated: October 5, 2026
          </p>
        </div>

        <div className="flex items-center gap-2 pt-4">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-bold text-foreground tracking-wide uppercase">
            1.1. Core System Infrastructure
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-border bg-card p-6 rounded-xl space-y-3 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Code2 className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-bold text-foreground">
                AI Verification & Guardrails
              </h3>
            </div>
            <p className="text-xs leading-relaxed">
              When an adversarial attack prompt is dispatched, the payload
              routes through our secure Node.js inference pipeline. Success
              evaluation occurs downstream via deterministic string hashing and
              automated regex pattern structures completely isolated from
              user-controlled memory segments.
            </p>
          </div>

          <div className="border border-border bg-card p-6 rounded-xl space-y-3 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-bold text-foreground">
                Solana On-Chain Programs & PDAs
              </h3>
            </div>
            <p className="text-xs leading-relaxed">
              The challenge vaults are managed by a native Solana Program
              compiled via Anchor. Vault balances are strictly bound to
              individual Program Derived Addresses (PDAs) derived from the
              challenge signature seeds. Payout invocation requires valid
              server-side cryptographic signatures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
