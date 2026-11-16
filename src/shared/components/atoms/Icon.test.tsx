import { render, screen } from "@testing-library/react";
import { Star } from "lucide-react";

import { Icon } from "@/shared/components/atoms/Icon";

describe("Icon", () => {
  it("é decorativo sem label", () => {
    render(<Icon icon={Star} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("é anunciado quando recebe label", () => {
    render(<Icon icon={Star} label="Favorito" />);
    expect(screen.getByRole("img", { name: "Favorito" })).toBeInTheDocument();
  });
});
