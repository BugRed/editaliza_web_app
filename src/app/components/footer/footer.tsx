"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Home, Settings, User } from "lucide-react";
import styles from "./footer.module.css";

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className={styles.footer}>
      <nav className={styles.nav} aria-label="Atalhos inferiores">
        <Link
          href="/"
          className={`${styles.item} ${pathname === "/" ? styles.itemActive : ""}`}
        >
          <Home size={20} />
          <span>Início</span>
        </Link>

        <Link
          href="/salvos"
          className={`${styles.item} ${pathname === "/salvos" ? styles.itemActive : ""}`}
        >
          <Bookmark size={20} />
          <span>Salvos</span>
        </Link>

        <Link
          href="/perfil"
          className={`${styles.item} ${pathname === "/perfil" ? styles.itemActive : ""}`}
        >
          <User size={20} />
          <span>Perfil</span>
        </Link>

        <Link
          href="/configuracoes"
          className={`${styles.item} ${pathname === "/configuracoes" ? styles.itemActive : ""}`}
        >
          <Settings size={20} />
          <span>Configurações</span>
        </Link>
      </nav>
    </footer>
  );
}