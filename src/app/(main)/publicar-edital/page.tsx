import { redirect } from "next/navigation";

// Endereço antigo: a publicação mora em /organizacao/editais/novo (mapa de telas, #13).
export default function PublicarEditalRedirectPage() {
  redirect("/organizacao/editais/novo");
}
