"use client";

import Link from "next/link";
import { Building2, MapPin, PlusCircle, Settings } from "lucide-react";
import AppShell from "@/app/components/shell/AppShell";
import ProfileView from "@/app/components/profile/ProfileView";
import { useSocialStore } from "@/app/hooks/useSocialStore";

function formatCnpj(cnpj: string): string {
  const digits = (cnpj || "").replace(/\D/g, "");
  if (digits.length === 14) {
    return digits.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }
  return cnpj || "Não informado";
}

export default function MeuPerfilPage() {
  const { currentProfile, currentProposer, isProposer } = useSocialStore();

  return (
    <AppShell title="Perfil">
      {isProposer && currentProposer ? (
        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentProposer.imgUrl}
              alt={currentProposer.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-[#0E7C86] bg-[#F0F6F7] shrink-0"
            />

            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FFF6D6] text-[#7A5400] text-xs font-bold mb-1.5">
                    <Building2 size={13} />
                    <span>Propositor de Editais</span>
                  </span>
                  <h2 className="text-xl font-bold text-[#102A30]">
                    {currentProposer.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#6B8388] mt-0.5">
                    <span>{currentProposer.handle}</span>
                    {(currentProposer.city || currentProposer.state) && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} />
                        {[currentProposer.city, currentProposer.state]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href="/configuracoes"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#DCE6E8] bg-white hover:bg-[#F0F6F7] text-sm font-semibold text-[#102A30] transition-colors shrink-0"
                >
                  <Settings size={15} />
                  <span>Configurar perfil</span>
                </Link>
              </div>

              <p className="text-sm text-[#4A656B] leading-relaxed">
                {currentProposer.bio}
              </p>

              <div className="flex flex-wrap gap-2 text-xs text-[#4A656B]">
                <span className="px-2.5 py-1 rounded-md bg-[#F8FAFB] border border-[#DCE6E8] font-medium tabular-nums">
                  CNPJ: {formatCnpj(currentProposer.cnpj)}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#E6F4F5] border border-[#CBE5E8] text-[#09585F] font-semibold tabular-nums">
                  {currentProposer.listEdital.length}{" "}
                  {currentProposer.listEdital.length === 1
                    ? "edital publicado"
                    : "editais publicados"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#DCE6E8] flex flex-wrap gap-3">
            <Link
              href="/publicar-edital"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E7C86] text-white text-sm font-bold hover:bg-[#0B656D] transition-colors"
            >
              <PlusCircle size={17} />
              <span>Publicar novo edital</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DCE6E8] text-sm font-semibold text-[#102A30] hover:bg-[#F0F6F7] transition-colors"
            >
              Ver editais no Início
            </Link>
          </div>
        </div>
      ) : (
        <ProfileView profile={currentProfile} isOwnProfile={true} />
      )}
    </AppShell>
  );
}
