import React from "react";
import {
  Shield,
  Terminal,
  AlertTriangle,
  UserCheck,
  EyeOff,
  Zap,
} from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-foreground selection:text-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="border-b border-border pb-8 mb-12">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-6 h-6 text-foreground/80 stroke-[1.5]" />
            <h1 className="text-2xl font-semibold tracking-tight">
              SolSecureAI
            </h1>
          </div>
          <p className="text-xl font-medium tracking-tight mb-2">
            Terms of Service
          </p>
          <p className="text-muted-foreground text-xs font-mono">
            Last Updated: October 5, 2026
          </p>
        </div>

        <div className="border border-border rounded-lg p-5 mb-12 text-sm bg-muted/30 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-foreground/70 shrink-0 mt-0.5 stroke-[1.5]" />
          <div>
            <span className="font-semibold block mb-1">
              Important Disclaimer:
            </span>
            By participating in our AI challenges, prompt injection tests, or
            capture-the-flag (CTF) events, you strictly agree to the Terms of
            Service and Privacy Policy. Any unauthorized activity outside the
            sandbox environment is strictly prohibited.
          </div>
        </div>

        <div className="space-y-12 text-sm leading-relaxed">
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
              <UserCheck className="w-4 h-4 text-foreground/60 stroke-[1.5]" />
              <h2 className="text-base font-semibold tracking-tight">
                1.1. Introduction & Eligibility
              </h2>
            </div>
            <p className="text-muted-foreground">
              Welcome to SolSecureAI ("Platform"). By accessing, connecting your
              decentralized digital wallet, or participating in our AI hacking
              and prompt injection challenges, you explicitly agree to comply
              with and be bound by these Terms of Service.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="border border-border rounded-lg p-4 bg-muted/10">
                <span className="font-medium block mb-1">Age Requirement</span>
                <span className="text-muted-foreground text-xs">
                  You must be at least 18 years old (or the legal age of
                  majority in your jurisdiction) to participate and claim any
                  rewards.
                </span>
              </div>
              <div className="border border-border rounded-lg p-4 bg-muted/10">
                <span className="font-medium block mb-1">
                  Web3 Responsibility
                </span>
                <span className="text-muted-foreground text-xs">
                  You are solely responsible for securing your own decentralized
                  digital wallet (e.g., Phantom, Solflare). The platform is not
                  liable for compromised private keys.
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
              <Terminal className="w-4 h-4 text-foreground/60 stroke-[1.5]" />
              <h2 className="text-base font-semibold tracking-tight">
                1.2. Scope of Authorized Activities (The Sandbox Rule)
              </h2>
            </div>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">
                Authorized Testing:
              </span>{" "}
              You are strictly authorized to perform prompt injection,
              jailbreaking, and adversarial text-based attacks{" "}
              <span className="underline decoration-border/80 underline-offset-4">
                ONLY within the designated user input fields
              </span>{" "}
              of the provided AI models.
            </p>
            <div className="border border-border rounded-lg p-4 bg-muted/20">
              <span className="font-semibold block text-foreground mb-1">
                Unauthorized Attacks:
              </span>
              <p className="text-muted-foreground text-xs">
                Any attacks targeting the underlying website infrastructure,
                servers, hosting providers, smart contracts, databases, APIs, or
                other user accounts (including but not limited to DDoS, SQL
                injection, XSS, brute-forcing, or reverse-engineering backend
                code) are strictly prohibited and will be treated as unlawful
                cyberattacks.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
              <EyeOff className="w-4 h-4 text-foreground/60 stroke-[1.5]" />
              <h2 className="text-base font-semibold tracking-tight">
                1.3. Anti-Cheating, Wallet Binding & Rate Limiting
              </h2>
            </div>
            <ul className="space-y-3 text-muted-foreground pl-1">
              <li className="flex gap-2">
                <span className="text-foreground/40">•</span>{" "}
                <span>
                  <strong className="text-foreground font-medium">
                    One Wallet Per User:
                  </strong>{" "}
                  Users are forbidden from creating multiple accounts or
                  connecting multiple Solana wallet addresses to bypass daily
                  limits or manipulate scores.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground/40">•</span>{" "}
                <span>
                  <strong className="text-foreground font-medium">
                    Automated Scripts:
                  </strong>{" "}
                  The use of automated scanners, fuzzers, headless browsers, or
                  rapid-fire API injection scripts is banned. We enforce strict
                  rate-limiting to protect our infrastructure.
                </span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
              <Zap className="w-4 h-4 text-foreground/60 stroke-[1.5]" />
              <h2 className="text-base font-semibold tracking-tight">
                1.4. Web3 Prize Eligibility & Verification Process
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong className="text-foreground font-medium">
                  Manual Review:
                </strong>{" "}
                No prize or financial reward will be distributed automatically.
                All winning prompts and attack payloads must undergo a
                comprehensive manual engineering review by our core security
                team.
              </p>
              <p>
                <strong className="text-foreground font-medium">
                  Reproducibility:
                </strong>{" "}
                To claim a prize, the exploit payload must be 100% reproducible
                and consistently trigger the winning condition under regular
                parameters.
              </p>
              <p>
                <strong className="text-foreground font-medium">
                  System Glitches:
                </strong>{" "}
                Exploits that rely on a physical website bug, server crash,
                logic error in our web code, or a temporary API failure (rather
                than a successful bypass of the AI's alignment guardrails) do
                not qualify for a reward.
              </p>
              <p>
                <strong className="text-foreground font-medium">
                  On-Chain Payouts:
                </strong>{" "}
                Verified rewards will be distributed exclusively in Solana (SOL)
                or designated SPL tokens to the verified Solana wallet address
                linked to the winning account.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
              <Shield className="w-4 h-4 text-foreground/60 stroke-[1.5]" />
              <h2 className="text-base font-semibold tracking-tight">
                1.5. Blockchain Risks & Transaction Finality
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong className="text-foreground font-medium">
                  Address Accuracy:
                </strong>{" "}
                You must provide a valid, correct Solana wallet address.
                SolSecureAI is not responsible for any lost, frozen, or
                misdirected funds resulting from incorrect user input.
              </p>
              <p>
                <strong className="text-foreground font-medium">
                  Irreversibility:
                </strong>{" "}
                Blockchain transactions are permanent. Once a prize transaction
                is broadcasted on the Solana network, the platform's financial
                obligation is fully fulfilled.
              </p>
              <p>
                <strong className="text-foreground font-medium">
                  Market Volatility:
                </strong>{" "}
                Cryptocurrency prices are highly volatile. The platform is not
                liable for changes in the fiat value (USD) of SOL between the
                time of winning and actual transaction processing.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
              <Terminal className="w-4 h-4 text-foreground/60 stroke-[1.5]" />
              <h2 className="text-base font-semibold tracking-tight">
                1.6. AI Output & Hallucination Disclaimer
              </h2>
            </div>
            <p className="text-muted-foreground mb-2">
              <strong className="text-foreground font-medium">
                Nature of AI Challenges:
              </strong>{" "}
              You acknowledge that you are interacting with Large Language
              Models designed for security testing. AI models can hallucinate,
              generate inaccurate, unpredictable, offensive, or harmful content
              when subjected to prompt injection attacks.
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground font-medium">
                Limitation of Liability:
              </strong>{" "}
              SolSecureAI does not endorse, control, or take responsibility for
              any text, code, or outputs generated by the AI models during the
              challenges. All AI responses are the sole byproduct of
              user-submitted prompts.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
              <Shield className="w-4 h-4 text-foreground/60 stroke-[1.5]" />
              <h2 className="text-base font-semibold tracking-tight">
                1.7. Exploit Ownership & Intellectual Property
              </h2>
            </div>
            <p className="text-muted-foreground">
              By submitting a successful exploit or prompt to the platform, you
              grant SolSecureAI a non-exclusive, royalty-free, worldwide license
              to review, analyze, use, and publish the payload as part of
              security case studies, academic research, or to improve AI defense
              alignment guardrails.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
