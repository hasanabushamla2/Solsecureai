import "../globals.css";
import ThemeProvider from "@/components/layout/ThemeProvider";
import SolanaProvider from "@/components/auth/WalletProvider";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Toaster } from "react-hot-toast";
import AuthGraud from "./AuthGraud";
import Header from "@/components/dashboard/Header";
import SideBar from "@/components/dashboard/SideBar";
import ContentArea from "@/components/dashboard/ContentArea";
import { SearchProvider } from "@/components/dashboard/SearchProvider";
import QueryProvider from "@/components/layout/QueryProvider";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body>
        <Toaster position="bottom-right" reverseOrder={false} />

        <ThemeProvider>
          <SolanaProvider>
            <AuthGraud>
              <QueryProvider>
                <SearchProvider>
                  <main className="bg-background">
                    <div className="relative w-full flex flex-row">
                      <SideBar />
                      <ContentArea>
                        <div className="w-full flex-1 bg-background">
                          <Header />
                          {children}
                        </div>
                      </ContentArea>
                    </div>
                  </main>
                </SearchProvider>
              </QueryProvider>
            </AuthGraud>
          </SolanaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

