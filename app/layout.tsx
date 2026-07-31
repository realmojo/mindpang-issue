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
      <head suppressHydrationWarning>
        {/* Taboola 로더 — 초기 HTML head 에서 실행. 경로 depth 로 PAGE_TYPE 을
            판별(홈=homepage, 그 외=article)하고 loader.js 를 주입한다(차단 시 privacy
            로더로 폴백). 관리자/API 등 비콘텐츠 경로에서는 로더를 띄우지 않는다.
            사이트 내 이동이 전부 <a> 태그(전체 리로드)라 매 페이지마다 이 스크립트가 다시
            실행되어 PAGE_TYPE 이 항상 경로와 일치한다.
            PAGE_TYPE 선언은 여기서 전담하고, 위젯 컴포넌트는 container 만 push 한다. */}
        <script
          id="taboola-loader"
          dangerouslySetInnerHTML={{
            __html: `(function () {
  // Next 가 head 인라인 스크립트를 body 에도 한 번 더 렌더하므로,
  // 페이지당 한 번만 실행되도록 가드한다(전체 리로드마다 window 는 초기화됨).
  if (window.__tbLoaderInit) return;
  window.__tbLoaderInit = true;

  var PUBLISHER_ID = 'mojoday-network';
  var seg = location.pathname.split('/').filter(Boolean);

  var EXCLUDED = ['admin', 'api'];
  if (seg.length > 0 && EXCLUDED.indexOf(seg[0]) !== -1) return;

  var PAGE_TYPE = seg.length === 0 ? 'homepage' : 'article';

  var LOADER_URL = '//cdn.taboola.com/libtrc/' + PUBLISHER_ID + '/loader.js';
  var LOADER_PRIVACY_URL = '//static.tblcontent.com/libtrc/' + PUBLISHER_ID + '/loader.privacy.js';
  var PIXEL_URL = 'https://static.qovani.com/libtrc/tr5?type=pixel&publisher=' + PUBLISHER_ID;
  var SCRIPT_ID = 'tb_loader_script';

  window._taboola = window._taboola || [];

  var pageTypePush = {};
  pageTypePush[PAGE_TYPE] = 'auto';
  _taboola.push(pageTypePush);

  new Image().src = PIXEL_URL;

  var firstScript = document.getElementsByTagName('script')[0];

  function injectLoader(id, src, fallbackSrc) {
    if (document.getElementById(id)) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    s.id = id;
    if (fallbackSrc) {
      s.onerror = function () {
        if (s.parentNode) s.parentNode.removeChild(s);
        injectLoader(SCRIPT_ID + '_fb', fallbackSrc, null);
      };
    }
    firstScript.parentNode.insertBefore(s, firstScript);
  }

  injectLoader(SCRIPT_ID, LOADER_URL, LOADER_PRIVACY_URL);

  if (window.performance && typeof window.performance.mark === 'function') {
    window.performance.mark('tbl_ic');
  }
})();`,
          }}
        />
      </head>
      <body className="min-h-svh">
        {/* Google AdSense (React 19 가 async 스크립트를 <head> 로 호이스팅) */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9130836798889522"
          crossOrigin="anonymous"
        />
        {/* Google Analytics (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-0Z6GPEQS69"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-0Z6GPEQS69');`,
          }}
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
        {/* Taboola 플러쉬 — <body> 끝에서 큐를 커밋한다. 위젯은 클라이언트 마운트 후
            push 되므로 <TaboolaFeed /> 가 스스로 한 번 더 flush 한다(중복은 무해). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window._taboola = window._taboola || [];
_taboola.push({flush: true});`,
          }}
        />
      </body>
    </html>
  )
}
