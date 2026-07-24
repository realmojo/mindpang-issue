import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteFooter } from "@/components/site-footer"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — 오늘의 이슈`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: {
    other: {
      "naver-site-verification": "e87cc376d449d88606b06dfc7e1063625b133b01",
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-svh">
        {/* Google AdSense (React 19 가 async 스크립트를 <head> 로 호이스팅) */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9130836798889522"
          crossOrigin="anonymous"
        />
        {/* 네이버 애널리틱스 (Wcslog) */}
        <script src="//wcs.pstatic.net/wcslog.js" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if(!wcs_add) var wcs_add = {};
wcs_add["wa"] = "17ca51bdf5daf30";
if(window.wcs) {
  wcs_do();
}`,
          }}
        />
        <ThemeProvider>
          <main className="min-h-[70svh]">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  )
}
