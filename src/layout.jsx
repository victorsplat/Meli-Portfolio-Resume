import '../resources/style/styles.css';

export const metadata = {
  title: 'Meli Portfolio',
  description: 'Fast and optimized portfolio built with React, TypeScript, and Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}