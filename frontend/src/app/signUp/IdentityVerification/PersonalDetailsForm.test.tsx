import { render, screen, fireEvent, act } from "@testing-library/react";

import PersonalDetailsForm from "./PersonalDetailsForm";

window.scrollTo = jest.fn();

describe("PersonalDetailsForm", () => {
  beforeEach(() => {
    render(
      <PersonalDetailsForm
        orgExternalId="foo"
        firstName={"Bob"}
        middleName={"Rob"}
        lastName={"Bobberton"}
      />
    );
  });

  it("displays the users full name", function () {
    expect(screen.getByText("Bob Rob Bobberton")).toBeInTheDocument();
  });

  it("initializes with the submit button disabled", () => {
    expect(screen.getByText("Submit")).toHaveAttribute("disabled");
  });

  describe("Filling out the form", () => {
    beforeEach(() => {
      fireEvent.change(screen.getByLabelText("Email *", { exact: false }), {
        target: { value: "bob@bob.bob" },
      });
    });

    it("enables the submit button", () => {
      expect(screen.getByText("Submit")).not.toHaveAttribute("disabled");
    });
    describe("focusing and not adding a value", () => {
      beforeEach(async () => {
        await act(async () => {
          await screen
            .getByLabelText("Phone number *", { exact: false })
            .focus();
          await screen
            .getByLabelText("Street address 1", { exact: false })
            .focus();
        });
      });
      it("shows a single error", () => {
        expect(
          screen.getByText("A valid phone number is required")
        ).toBeInTheDocument();
      });
    });
    describe("On submitting with an invalid phone number", () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.change(
            screen.getByLabelText("Phone number", { exact: false }),
            {
              target: { value: "123" },
            }
          );
          fireEvent.click(screen.getByText("Submit"));
        });
      });
      it("shows an error", () => {
        expect(
          screen.getByText("A valid phone number is required")
        ).toBeInTheDocument();
      });
    });
    describe("On clicking an invalid date of birth and submitting", () => {
      beforeEach(async () => {
        fireEvent.click(screen.getByTestId("date-picker-button"));
        const nextMonthButton = screen.getByTestId("next-month");
        expect(nextMonthButton).toHaveClass(
          "usa-date-picker__calendar__next-month"
        );
        fireEvent.click(nextMonthButton);
        const dateButton = screen.getByText("15");
        expect(dateButton).toHaveClass("usa-date-picker__calendar__date");
        fireEvent.click(dateButton);
        await act(async () => {
          fireEvent.click(screen.getByText("Submit"));
        });
      });
      it("shows an error", () => {
        expect(
          screen.getByText("A valid date of birth is required")
        ).toBeInTheDocument();
      });
    });
    describe("On typing an invalid date of birth format and submitting", () => {
      beforeEach(async () => {
        fireEvent.change(screen.getByTestId("date-picker-external-input"), {
          target: { value: "1/2" },
        });
        await act(async () => {
          fireEvent.click(screen.getByText("Submit"));
        });
      });
      it("shows an error", () => {
        expect(
          screen.getByText("A valid date of birth is required")
        ).toBeInTheDocument();
      });
    });
    describe("On typing a really old date and submitting", () => {
      beforeEach(async () => {
        fireEvent.change(screen.getByTestId("date-picker-external-input"), {
          target: { value: "08/07/1872" },
        });
        await act(async () => {
          fireEvent.click(screen.getByText("Submit"));
        });
      });
      it("shows an error", () => {
        expect(
          screen.getByText("A valid date of birth is required")
        ).toBeInTheDocument();
      });
    });
    describe("On typing a future date and submitting", () => {
      beforeEach(async () => {
        fireEvent.change(screen.getByTestId("date-picker-external-input"), {
          target: { value: "08/07/2172" },
        });
        await act(async () => {
          await screen
            .getByLabelText("Phone number *", { exact: false })
            .focus();
          fireEvent.click(screen.getByText("Submit"));
        });
      });
      it("shows an error", () => {
        expect(
          screen.getByText("A valid date of birth is required")
        ).toBeInTheDocument();
      });
    });
    describe("On submitting an incomplete form", () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.change(screen.getByLabelText("Email", { exact: false }), {
            target: { value: "bob@bob.bob" },
          });
          fireEvent.click(screen.getByText("Submit"));
        });
      });
      it("shows an error", () => {
        expect(
          screen.queryAllByText("is required", { exact: false }).length
        ).toBe(6);
      });
    });
  });

  describe("Completed form", () => {
    beforeEach(() => {
      fireEvent.click(screen.getByTestId("date-picker-button"));
      const dateButton = screen.getByText("15");
      expect(dateButton).toHaveClass("usa-date-picker__calendar__date");
      fireEvent.click(dateButton);
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
      fireEvent.change(screen.getByLabelText("ZIP code", { exact: false }), {
        target: { value: "74783" },
      });
    });

    describe("On submit", () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.click(screen.getByText("Submit"));
        });
      });
      it("does not shows an error", () => {
        expect(screen.queryAllByText("is required").length).toBe(0);
      });
    });
  });
});
