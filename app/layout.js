import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { dark } from "@clerk/themes";

// Initialize Inter font with Latin subset for optimal text rendering
const inter = Inter({ subsets: ["latin"] });

// Define metadata for the application - used by Next.js for SEO and page titles
export const metadata = {
  title: "AI Career Coach",
  description: "",
};

// Root layout component that wraps all pages in the application
export default function RootLayout({ children }) {
  return (
    // Clerk authentication provider with dark theme configuration
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      {/* HTML root element with English language and hydration warning suppression */}
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Set the favicon to the logo image */}
          <link rel="icon" href="/logo.png" sizes="any" />
        </head>
        {/* Body element with Inter font applied */}
        <body className={`${inter.className}`}>
          {/* Theme provider for dark/light mode switching with system preference support */}
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/* Navigation header component */}
            <Header />
            {/* Main content area with minimum full screen height */}
            <main className="min-h-screen">{children}</main>
            {/* Toast notification system with rich colors */}
            <Toaster richColors />

            {/* Footer section with creator attribution */}
            <footer className="bg-muted/50 py-12">
              <div className="container mx-auto px-4 text-center text-gray-200">
                <p>Made with 🔥 by Swapnil Datta</p>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
