import ProtectedRoute from "@/shared/components/organisms/ProtectedRoute";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-(--background)">
          <div className="text-(--text-muted) text-sm font-medium">
            Verificando autenticação...
          </div>
        </div>
      }
    >
      {children}
    </ProtectedRoute>
  );
}