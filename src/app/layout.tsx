import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Appoint — Book appointments with ease",
  description: "Client, provider, and admin portal for the appointment booking system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              expand
              duration={4000}
              toastOptions={{
                classNames: {
                  toast:
                    "font-sans shadow-lg border border-stone-200/80 bg-white text-stone-900",
                  success: "border-emerald-200",
                  error: "border-red-200",
                },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
