import type { Metadata } from 'next';
// Temporarily simplified fonts to test
// import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// const inter = Inter({ 
//   subsets: ['latin'],
//   variable: '--font-inter',
//   display: 'swap',
// });

// const playfair = Playfair_Display({
//   subsets: ['latin'],
//   variable: '--font-playfair',
//   display: 'swap',
// });

// const jetbrainsMono = JetBrains_Mono({
//   subsets: ['latin'],
//   variable: '--font-jetbrains',
//   display: 'swap',
// });

export const metadata: Metadata = {
  title: 'Online Nursery - Plants, Trees & Garden Supplies',
  description: 'Discover a wide selection of plants, trees, and garden supplies. Expert advice and quality products for your garden.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // #region agent log
  console.error('[DEBUG] layout.tsx RootLayout rendering', JSON.stringify({childrenType:typeof children}));
  // #endregion

  try {
    return (
      <html lang="en">
        <body className="font-sans antialiased">
          {children}
        </body>
      </html>
    );
  } catch (error: any) {
    console.error('[DEBUG] layout.tsx ERROR', JSON.stringify({error:error?.message}));
    return (
      <html lang="en">
        <body>
          <div>Layout Error: {String(error?.message || 'Unknown error')}</div>
        </body>
      </html>
    );
  }
}

