import { render, screen } from "@testing-library/react";

import { SearchBar } from "@/shared/components/molecules/SearchBar";

describe("SearchBar", () => {
  it("envia por GET para a ação, mantendo o termo atual", () => {
    render(<SearchBar action="/feed" defaultValue="pintura" />);
    expect(screen.getByRole("search")).toHaveAttribute("method", "get");
    expect(screen.getByRole("searchbox", { name: "Buscar editais" })).toHaveValue("pintura");
  });
});
