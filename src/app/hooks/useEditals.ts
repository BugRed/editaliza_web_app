"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import type { IEdital } from "../types/Edital";

// Lista de editais para telas que não passam pelo ranking (perfil do proponente, página do selo).
export function useEditals(): { editais: IEdital[]; loading: boolean } {
  const { token } = useAuth();
  const [editais, setEditais] = useState<IEdital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load(): Promise<void> {
      try {
        const res = await fetch("/api/editals", {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) return;
        const data = (await res.json()) as IEdital[];
        if (active && Array.isArray(data)) setEditais(data);
      } catch {
        // Sem a lista a tela mostra o estado vazio; não há o que recuperar aqui.
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [token]);

  return { editais, loading };
}
