import { AdminEditalPanel } from "@/shared/components/organisms/AdminEditalPanel";
import { ADMIN_EDITAIS, REQUIREMENTS } from "@/shared/fixtures/prototype";

export default function PrototypeAdminPage() {
  return <AdminEditalPanel editais={ADMIN_EDITAIS} requirements={REQUIREMENTS} />;
}
