"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Sun } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import styles from "./header.module.css";

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandIcon} aria-hidden="true">
            <Sun size={18} strokeWidth={2.4} />
          </span>
          <span>Editaliza</span>
        </Link>

        <nav className={styles.nav} aria-label="Navegação principal">
          <Link
            href="/"
            className={`${styles.navLink} ${pathname === "/" ? styles.navLinkActive : ""}`}
          >
            Início
          </Link>
          <Link
            href="/salvos"
            className={`${styles.navLink} ${pathname === "/salvos" ? styles.navLinkActive : ""}`}
          >
            Salvos
          </Link>
          <Link
            href="/perfil"
            className={`${styles.navLink} ${pathname === "/perfil" ? styles.navLinkActive : ""}`}
          >
            Perfil
          </Link>
        </nav>

        <div className={styles.actions}>
          {user ? (
            <button
              type="button"
              onClick={logout}
              className={styles.actionButton}
              title={`Sair (${user.email})`}
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          ) : (
            <Link href="/login" className={styles.actionButton}>
              <span>Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}