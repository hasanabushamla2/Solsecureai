import Header from "@/components/layout/Header";
import "../globals.css";
import ThemeProvider from "@/components/layout/ThemeProvider";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/layout/Lenis";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import QueryProvider from "@/components/layout/QueryProvider";

const queryClient = new QueryClient();

export default function MarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background">
        <SmoothScroll />
        <ThemeProvider>
          <QueryProvider>
            <Header />
            <div className="flex min-h-screen flex-col gap-5 w-full mx-auto max-w-7xl">
              <main className="flex-1 p-4  main-scroll-container">
                {children}
              </main>
            </div>
            <Footer />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
