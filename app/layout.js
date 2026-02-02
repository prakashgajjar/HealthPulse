import './globals.css';
import { AuthProvider } from '@/app/context/AuthContext';
import { Navbar } from '@/app/components/Navbar';

export const metadata = {
  title: 'Health Analytics System',
  description: 'Digital health analytics system for community health trend analysis',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
