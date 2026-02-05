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
  title: "AI Career Coach - Smart Resume Builder & Interview Prep Platform",
  description: "Transform your career with AI-powered tools. Build professional resumes, generate tailored cover letters, practice mock interviews, and get personalized career guidance. Land your dream job faster with intelligent career coaching.",
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

            {/* Professional footer section */}
            <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* Company Info */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg">AI Career Coach</h3>
                    <p className="text-sm leading-relaxed">
                      Empowering professionals with AI-driven career guidance, resume optimization, and interview preparation.
                    </p>
                  </div>

                  {/* Quick Links */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
                      <li><a href="/resume" className="hover:text-white transition-colors">Resume Builder</a></li>
                      <li><a href="/ai-cover-letter" className="hover:text-white transition-colors">Cover Letters</a></li>
                      <li><a href="/interview" className="hover:text-white transition-colors">Interview Prep</a></li>
                    </ul>
                  </div>

                  {/* Resources */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Resources</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="#" className="hover:text-white transition-colors">Career Tips</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Industry Insights</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                    </ul>
                  </div>

                  {/* Legal */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Legal</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                    </ul>
                  </div>
                </div>

                {/* Bottom section */}
                <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                  <p className="text-sm text-gray-400">
                    © {new Date().getFullYear()} AI Career Coach. All rights reserved.
                  </p>
                  <div className="flex space-x-6 mt-4 md:mt-0">
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Privacy
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Terms
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Support
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
