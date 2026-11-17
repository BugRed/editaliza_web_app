import ThemeToggle from "@/app/components/shell/ThemeToggle";

// Login e cadastro não usam o AppShell, então o botão de tema mora aqui.
export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ThemeToggle className="fixed right-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border-subtle) bg-(--bg-card) text-(--text-muted) hover:text-(--foreground) cursor-pointer" />
      {children}
    </>
  );
}
