export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-zinc-300 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto border border-border p-8 rounded-2xl backdrop-blur-sm">
        
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight border-b border-border pb-4">
          Privacy Policy
        </h1>
        <p className="text-xs text-foreground mt-2">Last Updated: October 5, 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed">
          
          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">1. Introduction</h2>
            <p className="text-foreground/70">
              Welcome to SolSecureAI. We are committed to protecting your privacy. This Privacy Policy explains how our decentralized application interacts with your data when you participate in our AI prompt injection challenges.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">2. Data We Do Not Collect</h2>
            <p className="text-foreground/70">
              As a Web3 decentralized application, we prioritize user anonymity. We do not collect, store, or log any personally identifiable information (PII) such as your real name, email address, physical address, or phone number.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">3. Blockchain & Wallet Interaction</h2>
            <p className="text-foreground/70">
              To interact with SolSecureAI challenges, you must connect a compatible Solana wallet. We only access your public wallet address to verify smart contract interactions, PDA structures, and distribution of rewards on the Solana blockchain. We never have access to your private keys or seed phrases.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">4. AI Chat Logs and Prompts</h2>
            <p className="text-foreground/70">
              The prompts you submit to test our LLM guardrails are processed to evaluate password extraction and security vulnerabilities. These inputs are used strictly for real-time challenge validation and are not linked to any real-world identity.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">5. Cookies and Session Tokens</h2>
            <p className="text-foreground/70">
              We use secure, localized session management tokens to maintain your authentication state securely within your browser. These tokens do not track your activity on external web platforms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">6. Changes to This Policy</h2>
            <p className="text-foreground/70">
              We reserve the right to update this Privacy Policy at any time. Any modifications will be posted directly on this page with an updated timestamp.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
