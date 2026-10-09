export default function AIDisclaimer() {
  return (
    <div className="min-h-screen bg-background text-foreground/70 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto border border-border p-8 rounded-2xl backdrop-blur-sm">
        
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight border-b border-border pb-4">
          AI Disclaimer & Terms of Interaction
        </h1>
        <p className="text-xs text-zinc-500 mt-2">Last Updated: October 5, 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed">
          
          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">1. Nature of AI Interactions</h2>
            <p className="text-foreground/70">
              SolSecureAI provides specialized Large Language Models (LLMs) configured with custom security guardrails for prompt injection testing. By interacting with these models, you acknowledge that AI responses are generated algorithmically and can be unpredictable, emergent, or inconsistent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">2. Experimental Testing Environment</h2>
            <p className="text-foreground/70">
              This platform functions strictly as an experimental security sandbox and decentralised audit environment. The challenges are designed to test the limits of LLM vulnerability and adversarial prompt engineering. Actions performed within the chat interfaces do not impact real-world production AI systems.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">3. No Guarantee of Outcome</h2>
            <p className="text-foreground/70">
              While all challenge rewards are bound to automated Solana smart contracts (PDAs), the validation of a successful password extraction is determined strictly by our automated backend evaluation system. SolSecureAI guarantees immediate payout upon cryptographic and systemic validation, but does not guarantee that any specific prompting technique will yield a successful breach.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">4. Adversarial Inputs & Ethical Conduct</h2>
            <p className="text-foreground/70">
              Users are encouraged to use creative adversarial engineering to test our LLM guardrails. However, any attempts to exploit infrastructure vulnerabilities, perform Denial of Service (DoS) attacks on the underlying API gateways, or inject malicious executable code into the platform backend are strictly prohibited and will result in wallet disqualification.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">5. Limitation of Liability</h2>
            <p className="text-foreground/70">
              SolSecureAI, its developers, and organizers of the Solana Hackathon are not liable for any direct or indirect consequences resulting from your interaction with the AI models, data variations on the Solana Devnet, or temporal RPC latency that may affect transaction routing.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
