export default function FAQ() {
  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto border border-border p-8 rounded-2xl backdrop-blur-sm">
        
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight border-b border-border pb-4">
          Frequently Asked Questions (FAQ)
        </h1>

        <div className="mt-8 space-y-6">
          
          <div className="border-b border-border pb-4">
            <h3 className="text-base font-bold text-foreground mb-2">What is SolSecureAI?</h3>
            <p className="text-sm text-foreground/70 leading-relaxed">
              SolSecureAI is a decentralized platform that bridges AI safety with blockchain security. Users challenge specialized LLMs to extract locked passwords, proving vulnerabilities or robustness through decentralized gamification.
            </p>
          </div>

          <div className="border-b border-border pb-4">
            <h3 className="text-base font-bold text-foreground mb-2">How are the rewards distributed?</h3>
            <p className="text-sm text-foreground/70 leading-relaxed">
              All challenge funds and prizes are locked securely inside Solana Program Derived Addresses (PDAs). Once our system validates a successful password extraction, the smart contract automatically and instantly releases the prize directly to the winner's wallet.
            </p>
          </div>

          <div className="border-b border-border pb-4">
            <h3 className="text-base font-bold text-foreground mb-2">Do I need to hold a session token to play?</h3>
            <p className="text-sm text-foreground/70 leading-relaxed">
              You can browse all public challenges, view leaderboard statistics, and inspect active contracts freely without a session. Connecting your Solana wallet and initializing a secure session is only required when actively interacting with the AI chat to attempt a challenge.
            </p>
          </div>

          <div className="border-b border-border pb-4">
            <h3 className="text-base font-bold text-foreground mb-2">Is the prompt injection testing safe?</h3>
            <p className="text-sm text-foreground/70 leading-relaxed">
              Yes. All interactions are handled within secure, isolated sandboxes. SolSecureAI serves as a decentralized prompt security auditor, creating a transparent, incentive-driven environment for discovering LLM guardrail bypasses safely.
            </p>
          </div>

          <div className="pb-2">
            <h3 className="text-base font-bold text-foreground mb-2">Which network is currently active?</h3>
            <p className="text-sm text-foreground/70 leading-relaxed">
              The platform is currently fully operational and integrated live with the Solana Devnet for real-time validation and testing purposes during the hackathon phase.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
