import { render, screen } from "@testing-library/react";
import GameCard from "./GameCard";

describe("GameCard", () => {
  it("renders title and description", () => {
    render(<GameCard title="Flash Garden" description="Match pairs" />);
    expect(screen.getByText("Flash Garden")).toBeInTheDocument();
    expect(screen.getByText("Match pairs")).toBeInTheDocument();
  });
});
