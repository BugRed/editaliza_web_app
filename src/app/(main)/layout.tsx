import ProtectedRoute from "../components/auth/ProtectedRoute";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFB]">
          <div className="text-[#4A656B] text-sm font-medium">
            Verificando autenticação...
          </div>
        </div>
      }
    >
      {children}
    </ProtectedRoute>
  );
}