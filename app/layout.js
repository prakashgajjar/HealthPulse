import './globals.css';
import { AuthProvider } from '@/app/context/AuthContext';
import { Navbar } from '@/app/components/Navbar';
import ChatBot from '@/app/components/ChatBot';

export const metadata = {
  title: 'Health Analytics System',
  description: 'Digital health analytics system for community health trend analysis',
  manifest: '/manifest.json',
};

// ✅ Correct place for theme color (Next.js 14)
export const viewport = {
  themeColor: '#10b981',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* PWA essentials */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HealthPulse" />

        {/* iOS icon */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>

      <body className="bg-gray-50">
        <AuthProvider>
          <Navbar />
          {children}
          <ChatBot />
        </AuthProvider>
      </body>
    </html>
  );
}
