import "./globals.css";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import { ConvexClintProvider } from "@/components/providers/convex-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "Jotion",
  description: "The connected workspace where better faster work happens.",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/logo.svg",
        href: "/logo.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/logo-dark.svg",
        href: "/logo-dark.svg",
      },
    ],
  },
};

// Per Next.js metadata guidance, themeColor should live in the viewport export
export const viewport = {
  themeColor: "#1F1F1F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="overflow-x-hidden">
        <ConvexClintProvider>
          <ThemeProvider
            defaultTheme="system"
            storageKey="jotion-theme-1"
          >
            <Toaster position="bottom-center" />
            {children}
          </ThemeProvider>
        </ConvexClintProvider>
      </body>
    </html>
  );
}
