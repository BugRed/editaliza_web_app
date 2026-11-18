import Link from "next/link";
import ProfileView from "@/shared/components/organisms/ProfileView";
import type { ArtistProfile } from "@/app/lib/user-profiles";

/** Perfil de outro artista. Portfólio privado mostra só o cartão de apresentação. */
export default function ArtistPublicView({ profile }: { profile: ArtistProfile }) {
  if (profile.portfolioVisibility !== "PRIVATE") return <ProfileView profile={profile} isOwnProfile={false} />;

  return (
    <div className="p-8 text-center space-y-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={profile.avatarUrl} alt={profile.name} className="mx-auto h-20 w-20 rounded-full object-cover border border-(--border-subtle)" />
      <h2 className="text-lg font-bold text-(--foreground)">{profile.name}</h2>
      <p className="text-sm text-(--text-subtle)">{profile.handle}</p>
      <p role="status" className="text-sm text-(--text-muted)">
        Este artista mantém o portfólio privado.
      </p>
      <Link href="/" className="inline-flex text-sm font-semibold text-(--primary-fg) hover:underline">
        Voltar ao início
      </Link>
    </div>
  );
}
