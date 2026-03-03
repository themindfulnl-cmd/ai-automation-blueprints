# Next.js App Router: SEO & Performance Optimization Guide

**Author:** Gagan Deep | AI Engineer

When LLMs scrape the web to form answers (AEO/GEO), or when Google attempts to rank your React application, **Total Blocking Time (TBT)** and **Largest Contentful Paint (LCP)** are the two most critical metrics. 

Here are the exact Next.js implementation snippets I used to achieve 84% Performance and 93% Structure on GTMetrix for a production business site.

---

## 1. Optimize the LCP Hero Image
The browser often delays loading the largest image on your screen because it's waiting for JavaScript to parse. Force the browser to prioritize it.

### The Fix: `fetchPriority="high"`
```tsx
import Image from "next/image";

export default function HeroSection() {
  return (
    <div className="relative w-full h-screen">
      <Image
        src="/hero-background.jpg"
        alt="A descriptive, keyword-rich alt text"
        fill
        sizes="100vw"
        priority // Tells Next.js to preload this
        fetchPriority="high" // Tells the browser to aggressively fetch it first
        className="object-cover"
      />
    </div>
  );
}
```

---

## 2. Eliminate Render-Blocking Scripts
Third-party scripts (Google Analytics, Meta Pixel, Tally Forms) will destroy your Total Blocking Time metric if loaded synchronously.

### The Fix: `strategy="lazyOnload"`
```tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        
        {/* Do not use 'afterInteractive' for heavy tracking scripts */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="lazyOnload" 
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </body>
    </html>
  );
}
```

---

## 3. Strict Cache-Control (Static Assets)
If you do not explicitly set Cache-Control headers for images, fonts, and CSS, performance trackers will flag you for "Serving static assets without an efficient cache policy."

### The Fix: Update `next.config.mjs`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Target all items processed by the Next.js Image component
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Target public folder images
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```
