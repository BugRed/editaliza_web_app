import { PublicArtistProfile } from "@/shared/components/organisms/PublicArtistProfile";
import { PUBLIC_ARTIST } from "@/shared/fixtures/prototype";

export default function PrototypeArtistPage() {
  return <PublicArtistProfile artist={PUBLIC_ARTIST} />;
}
