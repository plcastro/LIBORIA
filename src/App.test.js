import { render, screen } from "@testing-library/react";
import AppController from "./App";

test("renders learn react link", () => {
  render(<AppController />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
