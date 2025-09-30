import ProtectedRoute from '../components/auth/ProtectedRoute';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">Verificando autenticação...</div>
        </div>
      }
    >
      {children}
    </ProtectedRoute>
  );
}