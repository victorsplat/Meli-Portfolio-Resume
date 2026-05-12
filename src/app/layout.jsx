import '@styles/styles.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'Meli Portfolio',
  description: 'Fast and optimized portfolio built with React, TypeScript, and Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})();
`
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}