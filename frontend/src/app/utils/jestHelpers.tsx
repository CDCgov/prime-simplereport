import { ReactElement } from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * Setups userEvent and renders a component
 */
export function setup(component: ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(component),
  };
}
