import '@styles/styles.css';
import Providers from '@/components/Providers';
import Script from 'next/script';

export const metadata = {
  title: 'Meli Portfolio',
  description: 'Fast and optimized portfolio built with React, TypeScript, and Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark')`}
        </Script>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}