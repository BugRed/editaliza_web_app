import { render, screen } from "@testing-library/react";

import { StepIndicator } from "@/shared/components/molecules/StepIndicator";

describe("StepIndicator", () => {
  it("marca só a etapa atual como current", () => {
    render(<StepIndicator steps={["Identidade", "Obras", "Revisão"]} currentIndex={1} />);
    const current = screen.getAllByRole("listitem").filter((li) => li.getAttribute("aria-current") === "step");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent("2. Obras");
  });
});
