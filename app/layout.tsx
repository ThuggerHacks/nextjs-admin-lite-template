import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

import StyledComponentsRegistry from "@/theme/AntdRegistry";
import { HandleOnComplete } from "@/lib/router-events";
import ThemeProvider from "@/theme/theme-provider";
import { UserProvider } from "@/contexts/UserContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

const font = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Totalizer Platform",
  description: "Comprehensive file, report, and goal management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={""} suppressHydrationWarning={true}>
        <HandleOnComplete />
        <LanguageProvider>
          <UserProvider>
            <ThemeProvider>
              <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
            </ThemeProvider>
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
