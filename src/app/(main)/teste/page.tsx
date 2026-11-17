"use client";

import { useState, useEffect } from "react";
import { IEdital } from "@/app/types/Edital";
import { Proposer } from "@/app/types/Proposer";
import BodyCardFeed from "@/app/components/cardFeed/BodyCardFeed";
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";
import { mensagemDeErro } from "@/app/lib/erros";


export default function TesteFeedPage() {
  
  const [editals, setEditals] = useState<IEdital[]>([]);
  const [proposers, setProposers] = useState<Proposer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      try {
        const [editalsRes, proposersRes] = await Promise.all([
          fetch(`/api/editals`, {
            cache: "no-store",
            headers,
          }),
          fetch(`/api/proposers`, {
            cache: "no-store",
            headers,
          }),
        ]);

        if (!editalsRes.ok) {
          throw new Error(
            `Erro na busca de editais: ${editalsRes.status} ${editalsRes.statusText}`
          );
        }
        if (!proposersRes.ok) {
          throw new Error(
            `Erro na busca de proponentes: ${proposersRes.status} ${proposersRes.statusText}`
          );
        }

        setEditals(await editalsRes.json());
        setProposers(await proposersRes.json());
      } catch (err) {
        setError(mensagemDeErro(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="pt-24 pb-24 min-h-screen flex flex-col items-center justify-center p-4 bg-(--background)">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-(--border-subtle) border-t-(--primary-fg) mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-center text-(--foreground)">Feed de Editais</h1>
          <p className="text-(--text-muted) text-center text-sm">Carregando dados...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="pt-24 pb-24 min-h-screen flex flex-col items-center justify-center p-4 bg-(--background)">
          <h1 className="text-2xl font-bold mb-2 text-center text-(--foreground)">Feed de Editais</h1>
          <p className="text-(--danger) text-center text-sm">{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-24 pb-28 min-h-screen bg-(--background)">
        <div className="max-w-3xl mx-auto px-4 flex flex-col items-center gap-7">
          {editals.map((edital) => {
            const proposer = proposers.find((p) => p.id === Number(edital.proposer));
            if (!proposer) return null;
            return (
              <BodyCardFeed
                key={edital.id}
                percent="78"
                colorPercent="#0E7C86"
                coverImage={edital.imgCoverUrl || ""}
                title={edital.title}
                description={edital.description}
                proposer={proposer.name}
                proposerLink=""
                date={edital.publishDate}
                tags={Array.isArray(edital.listTags) ? edital.listTags : []}
                buttomSubmitLink={edital.inscriptionLink}
              />
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}