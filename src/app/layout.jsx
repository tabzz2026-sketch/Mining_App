import { Montserrat } from 'next/font/google';
import './globals.css'; // Make sure this points to your main Tailwind CSS file
import Navbar from '@/components/layout/Navbar'; // Adjust path if necessary

// Next.js automatically optimizes this font and serves it from your same domain
const montserrat = Montserrat({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans', // This connects directly to your Tailwind v4 config
});

// This replaces the <title> and <meta> tags in your old index.html
export const metadata = {
  title: 'E-Challan Logistics Track',
  description: 'Government of Jammu & Kashmir - Department of Geology & Mining',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable}`}>
      <body className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen flex flex-col">
        
        {/* Render the Navbar globally so you don't have to import it on every page */}
        {/* <Navbar /> */}
        
        {/* This renders your individual pages (AdminDashboard, VerifyPage, etc.) */}
        <main className="flex-grow relative overflow-hidden">
          {children}
        </main>
        
      </body>
    </html>
  );
}