import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ArtistSettingsForm from "@/shared/components/organisms/ArtistSettingsForm";
import type { ArtistProfile } from "@/app/lib/user-profiles";

const store = { updateCurrentProfile: vi.fn().mockResolvedValue(undefined) };
vi.mock("@/app/hooks/useSocialStore", () => ({ useSocialStore: () => store }));
vi.mock("@/shared/components/organisms/WorkManager", () => ({ default: () => null }));
vi.mock("@/shared/components/organisms/BadgeManager", () => ({ default: () => null }));

const profile = {
  id: 1,
  name: "Ana",
  handle: "@ana",
  city: "Recife",
  state: "PE",
  territoryScope: "MUNICIPAL",
  bio: "",
  avatarUrl: "/a.jpg",
  coreLanguages: ["Música"],
  supportLanguages: [],
  experienceYears: 3,
  profileLevel: "EMERGENTE",
  hasCnpjOrMei: false,
  hasTechnicalFormation: false,
} as unknown as ArtistProfile;

beforeEach(() => vi.clearAllMocks());

describe("ArtistSettingsForm", () => {
  it("uma linguagem é núcleo ou suporte, nunca as duas", async () => {
    render(<ArtistSettingsForm currentProfile={profile} />);
    const [coreMusica] = screen.getAllByRole("button", { name: "Música" });
    expect(coreMusica).toHaveAttribute("aria-pressed", "true");

    const supportMusica = screen.getAllByRole("button", { name: "Música" })[1];
    await userEvent.click(supportMusica);

    expect(screen.getAllByRole("button", { name: "Música" })[0]).toHaveAttribute("aria-pressed", "false");
    expect(screen.getAllByRole("button", { name: "Música" })[1]).toHaveAttribute("aria-pressed", "true");
  });

  it("salva com o @ no usuário e avisa que o perfil foi salvo", async () => {
    render(<ArtistSettingsForm currentProfile={profile} />);
    await userEvent.clear(screen.getByLabelText("Usuário (@)"));
    await userEvent.type(screen.getByLabelText("Usuário (@)"), "ana_nova");
    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(store.updateCurrentProfile).toHaveBeenCalledWith(expect.objectContaining({ handle: "@ana_nova" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Perfil salvo");
  });

  it("anos de atuação negativos bloqueiam o envio", async () => {
    render(<ArtistSettingsForm currentProfile={profile} />);
    fireEvent.change(screen.getByLabelText("Anos de atuação artística"), { target: { value: "-4" } });
    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(store.updateCurrentProfile).not.toHaveBeenCalled();
  });
});
