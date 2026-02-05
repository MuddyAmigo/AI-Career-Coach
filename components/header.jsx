import React from "react";
import { Button } from "./ui/button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  ChevronDown,
  StarsIcon,
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { checkUser } from "@/lib/checkUser";

// Async header component that handles user authentication and navigation
export default async function Header() {
  // Check and verify user authentication status
  await checkUser();

  return (
    // Fixed header with glassmorphism effect and backdrop blur
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
      {/* Main navigation container with responsive padding */}
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo/Brand link that navigates to homepage */}
        <Link href="/">
          <Image
            src={"/logo.png"}
            alt="Sensai Logo"
            width={200}
            height={60}
            className="h-12 py-1 w-auto object-contain"
          />
        </Link>

        {/* Action Buttons - Contains authentication-based navigation */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Navigation for authenticated users only */}
          <SignedIn>
            {/* Dashboard/Industry Insights link with responsive design */}
            <Link href="/dashboard">
              {/* Desktop version with text and icon */}
              <Button
                variant="outline"
                className="hidden md:inline-flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Industry Insights
              </Button>
              {/* Mobile version with icon only */}
              <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            </Link>

            {/* Growth Tools Dropdown menu for career development features */}
            <DropdownMenu>
              {/* Dropdown trigger button with stars icon and chevron */}
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-2">
                  <StarsIcon className="h-4 w-4" />
                  {/* Hide text on mobile devices */}
                  <span className="hidden md:block">Growth Tools</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              {/* Dropdown content with career development tools */}
              <DropdownMenuContent align="end" className="w-48">
                {/* Resume builder navigation item */}
                <DropdownMenuItem asChild>
                  <Link href="/resume" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Build Resume
                  </Link>
                </DropdownMenuItem>
                {/* AI-powered cover letter generator navigation item */}
                <DropdownMenuItem asChild>
                  <Link
                    href="/ai-cover-letter"
                    className="flex items-center gap-2"
                  >
                    <PenBox className="h-4 w-4" />
                    Cover Letter
                  </Link>
                </DropdownMenuItem>
                {/* Interview preparation tool navigation item */}
                <DropdownMenuItem asChild>
                  <Link href="/interview" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Interview Prep
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>

          {/* Sign in button for unauthenticated users */}
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>

          {/* User profile button for authenticated users */}
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  // Custom styling for user avatar
                  avatarBox: "w-10 h-10",
                  // Enhanced shadow for user menu popup
                  userButtonPopoverCard: "shadow-xl",
                  // Bold font for user name display
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
              // Redirect to homepage after sign out
              afterSignOutUrl="/"
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}