import "./globals.css";
export const metadata = { title: "PitchLab", description: "AI-powered softball pitcher analysis" };
export const viewport = { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false, themeColor: "#1e293b" };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PitchLab" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(e=>console.warn(e));});}` }} />
      </body>
    </html>
  );
}
