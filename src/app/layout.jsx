import '@styles/styles.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'Meli Portfolio',
  description: 'Fast and optimized portfolio built with React, TypeScript, and Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}