// app/layout.tsx
import './globals.css'; // Importa tus estilos globales
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Farmacia App',
  description: 'Aplicación de gestión de farmacia con Next.js y Prisma',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <nav className="bg-blue-600 p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-white text-2xl font-bold hover:text-blue-200 transition-colors">
              Farmacia App
            </Link>
            <div className="flex space-x-6">
              <Link href="/categorias" className="text-white hover:text-blue-200 transition-colors text-lg">
                Categorías
              </Link>
              <Link href="/productos" className="text-white hover:text-blue-200 transition-colors text-lg">
                Productos
              </Link>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-8">
          {children}
        </main>
      </body>
    </html>
  );
}