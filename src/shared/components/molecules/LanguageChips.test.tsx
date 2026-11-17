import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LanguageChips from "@/shared/components/molecules/LanguageChips";

describe("LanguageChips", () => {
  it("marca como pressionadas só as linguagens selecionadas", () => {
    render(
      <LanguageChips title="t" hint="h" tags={["Música", "Dança"]} selected={["Dança"]} variant="core" onToggle={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: "Dança" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Música" })).toHaveAttribute("aria-pressed", "false");
  });

  it("clicar numa linguagem devolve o nome dela", async () => {
    const onToggle = vi.fn();
    render(
      <LanguageChips title="t" hint="h" tags={["Música"]} selected={[]} variant="support" onToggle={onToggle} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Música" }));
    expect(onToggle).toHaveBeenCalledWith("Música");
  });
});
