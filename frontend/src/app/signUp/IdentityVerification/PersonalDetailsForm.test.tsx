import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import PersonalDetailsForm from "./PersonalDetailsForm";

describe("PersonalDetailsForm", () => {
  beforeEach(() => {
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/identity-verification", search: "?orgExternalId=foo" },
        ]}
      >
        <PersonalDetailsForm />
      </MemoryRouter>
    );
  });
  it("initializes with the submit button disabled", () => {
    expect(screen.getByText("Submit")).toHaveAttribute("disabled");
  });
  describe("Filling out the form", () => {
    beforeEach(() => {
      fireEvent.change(screen.getByLabelText("First name", { exact: false }), {
        target: { value: "Bob" },
      });
    });
    it("enables the submit button", () => {
      expect(screen.getByText("Submit")).not.toHaveAttribute("disabled");
    });
    describe("focusing and not adding a value", () => {
      beforeEach(async () => {
        await act(async () => {
          await screen.getByLabelText("Last name", { exact: false }).focus();
          await screen.getByText("Submit", { exact: false }).focus();
        });
      });
      it("shows a single error", () => {
        expect(screen.queryAllByText("Last name is required").length).toBe(1);
      });
    });
    describe("On submit", () => {
      beforeEach(async () => {
        await act(async () => {
          await fireEvent.click(
            screen.queryAllByText("Submit", {
              exact: false,
            })[0]
          );
        });
      });
      it("shows an error", () => {
        expect(
          screen.queryAllByText("is required", { exact: false }).length
        ).toBe(7);
      });
    });
  });
  describe("Completed form", () => {
    beforeEach(() => {
      fireEvent.change(screen.getByLabelText("First name", { exact: false }), {
        target: { value: "Bob" },
      });
      fireEvent.change(screen.getByLabelText("Last name", { exact: false }), {
        target: { value: "Bobberton" },
      });
      fireEvent.change(
        screen.getByLabelText("Date of birth", { exact: false }),
        {
          target: { value: "08/30/1986" },
        }
      );
      fireEvent.change(screen.getByLabelText("Email", { exact: false }), {
        target: { value: "bob@bob.bob" },
      });
      fireEvent.change(
        screen.getByLabelText("Phone number", { exact: false }),
        {
          target: { value: "530-867-5309" },
        }
      );
      fireEvent.change(
        screen.getByLabelText("Street address 1", { exact: false }),
        {
          target: { value: "123 Bob St" },
        }
      );
      fireEvent.change(screen.getByLabelText("City", { exact: false }), {
        target: { value: "Bobtown" },
      });
      fireEvent.change(screen.getByLabelText("State", { exact: false }), {
        target: { value: "CA" },
      });
      fireEvent.change(screen.getByLabelText("First name", { exact: false }), {
        target: { value: "Bob" },
      });
      fireEvent.change(screen.getByLabelText("ZIP code", { exact: false }), {
        target: { value: "74783" },
      });
    });

    describe("On submit", () => {
      beforeEach(async () => {
        await act(async () => {
          await fireEvent.click(
            screen.queryAllByText("Submit", {
              exact: false,
            })[0]
          );
        });
      });
      it("does not shows an error", () => {
        expect(screen.queryAllByText("is required").length).toBe(0);
      });
    });
  });
});
