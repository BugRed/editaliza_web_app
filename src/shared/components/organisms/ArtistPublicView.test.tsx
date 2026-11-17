import { render, screen } from "@testing-library/react";

import ArtistPublicView from "@/shared/components/organisms/ArtistPublicView";
import type { ArtistProfile } from "@/app/lib/user-profiles";

vi.mock("@/shared/components/organisms/ProfileView", () => ({ default: () => <p>perfil completo</p> }));

const profile = { id: 2, name: "Bruno Lima", handle: "@bruno", avatarUrl: "/b.jpg" } as ArtistProfile;

describe("ArtistPublicView", () => {
  it("portfólio público (ou sem a escolha gravada) mostra o perfil completo", () => {
    render(<ArtistPublicView profile={profile} />);
    expect(screen.getByText("perfil completo")).toBeInTheDocument();
  });

  it("portfólio privado mostra só o cartão e esconde o resto", () => {
    render(<ArtistPublicView profile={{ ...profile, portfolioVisibility: "PRIVATE" }} />);
    expect(screen.getByRole("status")).toHaveTextContent("portfólio privado");
    expect(screen.getByRole("heading", { name: "Bruno Lima" })).toBeInTheDocument();
    expect(screen.queryByText("perfil completo")).not.toBeInTheDocument();
  });
});
