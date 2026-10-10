import "../globals.css";
import ThemeProvider from "@/components/layout/ThemeProvider";
import SolanaProvider from "@/components/auth/WalletProvider";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Toaster } from "react-hot-toast";
import AuthGraud from "./AuthGruad";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata:Metadata = {
  title: "Sign In | SolSecureAI",
  description:
    "Connect your Solana wallet to access SolSecureAI, participate in AI security challenges, and manage your account securely.",
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const hasSession = cookieStore.has("session_token");
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Toaster position="bottom-right" reverseOrder={false} />

        <ThemeProvider>
          <SolanaProvider>
            <AuthGraud hasSession = {hasSession}>
              <main className="bg-background">{children}</main>
            </AuthGraud>
          </SolanaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
