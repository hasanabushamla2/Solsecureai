"use client";
import React, { useState } from "react";

const TermsOfService = () => {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="border-b border-border pb-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            SolSecureAI Terms of Service
          </h1>
          <p className="text-muted-foreground text-sm">
            Last Updated: October 5, 2026
          </p>
        </div>

        <div className="border border-border rounded-xl p-5 mb-8 text-sm leading-relaxed">
          <span className="font-bold block mb-1">
            Important Disclaimer for Users:
          </span>
          By participating in our AI challenges, prompt injection tests, or
          capture-the-flag (CTF) events, you strictly agree to the Terms of
          Service and Privacy Policy outlined below. Any unauthorized activity
          outside the sandbox environment is strictly prohibited.
        </div>

        <div className="space-y-8 leading-relaxed text-sm md:text-base">
          <section className="border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-3">
              1.1. Introduction & Eligibility
            </h2>
            <p className="mb-3">
              Welcome to SolSecureAI ("Platform"). By accessing, connecting your
              decentralized digital wallet, or participating in our AI hacking
              and prompt injection challenges, you explicitly agree to comply
              with and be bound by these Terms of Service.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Age Requirement:</strong>{" "}
                You must be at least 18 years old (or the legal age of majority
                in your jurisdiction) to participate and claim any rewards.
              </li>
              <li>
                <strong className="text-foreground">
                  Web3 Responsibility:
                </strong>{" "}
                You are solely responsible for securing your own decentralized
                digital wallet (e.g., Phantom, Solflare). SolSecureAI is not
                liable for compromised private keys or unauthorized wallet
                access.
              </li>
            </ul>
          </section>

          <section className="border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-3">
              1.2. Scope of Authorized Activities (The Sandbox Rule)
            </h2>
            <p className="mb-3">
              Authorized Testing: You are strictly authorized to perform prompt
              injection, jailbreaking, and adversarial text-based attacks ONLY
              within the designated user input fields of the provided AI models.
            </p>
            <p className="border border-border rounded-lg p-3">
              <span className="font-bold block mb-1">
                Unauthorized Attacks:
              </span>{" "}
              Any attacks targeting the underlying website infrastructure,
              servers, hosting providers, smart contracts, databases, APIs, or
              other user accounts (including but not limited to DDoS, SQL
              injection, XSS, brute-forcing, or reverse-engineering backend
              code) are strictly prohibited and will be treated as unlawful
              cyberattacks.
            </p>
          </section>

          <section className="border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-3">
              1.3. Anti-Cheating, Wallet Binding & Rate Limiting
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-foreground">
                  One Wallet Per User:
                </strong>{" "}
                Users are forbidden from creating multiple accounts or
                connecting multiple Solana wallet addresses to bypass daily
                limits, manipulate leaderboard scores, or hoard challenge
                attempts.
              </li>
              <li>
                <strong className="text-foreground">Automated Scripts:</strong>{" "}
                The use of automated scanners, fuzzers, headless browsers, or
                rapid-fire API injection scripts is banned unless explicitly
                stated. We enforce strict rate-limiting to protect our
                infrastructure.
              </li>
            </ul>
          </section>
          <section className="border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-3">
              1.4. Web3 Prize Eligibility & Verification Process
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong className="text-foreground">Manual Review:</strong> No
                prize or financial reward will be distributed automatically. All
                winning prompts and attack payloads must undergo a comprehensive
                manual engineering review by our core security team.
              </p>
              <p>
                <strong className="text-foreground">Reproducibility:</strong> To
                claim a prize, the exploit payload must be 100% reproducible and
                consistently trigger the winning condition under regular
                parameters.
              </p>
              <p>
                <strong className="text-foreground">System Glitches:</strong>{" "}
                Exploits that rely on a physical website bug, server crash,
                logic error in our web code, or a temporary API failure (rather
                than a successful bypass of the AI's alignment guardrails) do
                not qualify for a reward.
              </p>
              <p>
                <strong className="text-foreground">On-Chain Payouts:</strong>{" "}
                Verified rewards will be distributed exclusively in Solana (SOL)
                or designated SPL tokens to the verified Solana wallet address
                linked to the winning account.
              </p>
            </div>
          </section>

          <section className="border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-3">
              1.5. Blockchain Risks & Transaction Finality
            </h2>
            <div className="space-y-2">
              <p>
                <strong className="text-foreground">Address Accuracy:</strong>{" "}
                You must provide a valid, correct Solana wallet address.
                SolSecureAI is not responsible for any lost, frozen, or
                misdirected funds resulting from incorrect user input.
              </p>
              <p>
                <strong className="text-foreground">Irreversibility:</strong>{" "}
                Blockchain transactions are permanent. Once a prize transaction
                is broadcasted on the Solana network, the platform's financial
                obligation is fully fulfilled.
              </p>
              <p>
                <strong className="text-foreground">Market Volatility:</strong>{" "}
                Cryptocurrency prices are highly volatile. The platform is not
                liable for changes in the fiat value (USD) of SOL between the
                time of winning and actual transaction processing.
              </p>
            </div>
          </section>

          <section className="border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-3">
              1.6. AI Output & Hallucination Disclaimer
            </h2>
            <p className="mb-2">
              <strong className="text-foreground">
                Nature of AI Challenges:
              </strong>{" "}
              You acknowledge that you are interacting with Large Language
              Models designed for security testing. AI models can hallucinate,
              generate inaccurate, unpredictable, offensive, or harmful content
              when subjected to prompt injection attacks.
            </p>
            <p>
              <strong className="text-foreground">
                Limitation of Liability:
              </strong>{" "}
              SolSecureAI does not endorse, control, or take responsibility for
              any text, code, or outputs generated by the AI models during the
              challenges. All AI responses are the sole byproduct of
              user-submitted prompts.
            </p>
          </section>

          <section className="border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-3">
              1.7. Exploit Ownership & Intellectual Property
            </h2>
            <p>
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
