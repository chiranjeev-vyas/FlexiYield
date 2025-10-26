import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Web3Provider from "@/providers/Web3Provider";
import { TransactionHistoryProvider } from "@/providers/TransactionHistoryProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlexiYield - Maximize Your USDC Yields",
  description: "Find the best lending rates across chains and deposit with one click using Avail Nexus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Hide Next.js dev indicator
              if (typeof window !== 'undefined') {
                const hideNextJsIndicator = () => {
                  const selectors = [
                    'nextjs-portal',
                    '[data-nextjs-dialog]',
                    '[data-nextjs-dialog-overlay]',
                    'button[data-nextjs-errors]',
                    '[id*="nextjs"]',
                    '[class*="nextjs"]'
                  ];
                  selectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                      if (el) {
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                        el.remove();
                      }
                    });
                  });
                };
                
                // Run immediately and on DOM changes
                hideNextJsIndicator();
                setInterval(hideNextJsIndicator, 500);
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', hideNextJsIndicator);
                } else {
                  hideNextJsIndicator();
                }
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Provider>
          <TransactionHistoryProvider>
            {children}
          </TransactionHistoryProvider>
        </Web3Provider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#363636',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
