import "../globals.css";
import ThemeProvider from "@/components/layout/ThemeProvider";
import SolanaProvider from "@/components/auth/WalletProvider";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Toaster } from "react-hot-toast";
import AuthGraud from "./AuthGruad";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Toaster position="bottom-right" reverseOrder={false} />

        <ThemeProvider>
          <SolanaProvider>
            <AuthGraud>
              <main className="bg-background">{children}</main>
            </AuthGraud>
          </SolanaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
