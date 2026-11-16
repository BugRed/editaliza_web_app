import { render, screen } from "@testing-library/react";

import { AdminEditalPanel } from "@/shared/components/organisms/AdminEditalPanel";
import { CandidatesList } from "@/shared/components/organisms/CandidatesList";
import { TrajectoryView, WorksView } from "@/shared/components/organisms/RecordLists";
import { ADMIN_EDITAIS, CANDIDATES, EXPERIENCES, REQUIREMENTS, WORKS } from "@/shared/fixtures/prototype";

describe("listas com estado vazio", () => {
  it("trajetória e obras vazias convidam a cadastrar", () => {
    const { rerender } = render(<TrajectoryView experiences={[]} />);
    expect(screen.getByRole("heading", { name: "Nenhuma experiência registrada" })).toBeInTheDocument();
    rerender(<WorksView works={[]} />);
    expect(screen.getByRole("heading", { name: "Nenhuma obra cadastrada" })).toBeInTheDocument();
  });

  it("candidatos vazios explicam quando aparecem", () => {
    render(<CandidatesList editalTitle="X" candidates={[]} />);
    expect(screen.getByRole("heading", { name: "Ainda não há candidaturas" })).toBeInTheDocument();
  });
});

describe("listas com dados", () => {
  it("trajetória distingue experiência comprovada da sem comprovação", () => {
    render(<TrajectoryView experiences={EXPERIENCES} />);
    expect(screen.getByText("Comprovada")).toBeInTheDocument();
    expect(screen.getByText("Sem comprovação")).toBeInTheDocument();
  });

  it("obras listam técnica e suporte", () => {
    render(<WorksView works={WORKS} />);
    expect(screen.getByText(/Pintura · Tela · 2024/)).toBeInTheDocument();
  });

  it("candidatos mostram a elegibilidade de cada um", () => {
    render(<CandidatesList editalTitle="X" candidates={CANDIDATES} />);
    expect(screen.getByText("Elegível")).toBeInTheDocument();
    expect(screen.getByText("Não elegível")).toBeInTheDocument();
    expect(screen.getByText("A confirmar")).toBeInTheDocument();
  });

  it("admin mostra a falha de extração com a orientação e o requisito com evidência", () => {
    render(<AdminEditalPanel editais={ADMIN_EDITAIS} requirements={REQUIREMENTS} />);
    expect(screen.getByText("Falha na extração")).toBeInTheDocument();
    expect(screen.getByText(/Envie uma versão com texto/)).toBeInTheDocument();
    expect(screen.getByText("CORE")).toBeInTheDocument();
    expect(screen.getByText(/residência comprovada/)).toBeInTheDocument();
  });
});
