import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PersonalDetailsForm from "./PersonalDetailsForm";

window.scrollTo = jest.fn();

const fillInText = (label: string, text: string) => {
  fireEvent.change(screen.getByLabelText(label, { exact: false }), {
    target: { value: text },
  });
};

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

  it("displays the users full name", () => {
    expect(screen.getByText("Bob Rob Bobberton")).toBeInTheDocument();
  });

  it("initializes with the submit button disabled", () => {
    expect(screen.getByText("Submit")).toHaveAttribute("disabled");
  });

  describe("Filling out the form", () => {
    beforeEach(() => {
      userEvent.type(
        screen.getByLabelText("Email *", { exact: false }),
        "bob@bob.bob"
      );
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
          userEvent.type(
            screen.getByLabelText("Phone number", { exact: false }),
            "123"
          );
          userEvent.click(screen.getByText("Submit"));
        });
      });
      it("shows an error", () => {
        expect(
          screen.getByText("A valid phone number is required")
        ).toBeInTheDocument();
      });
    });
    describe("On submitting an invalid street address 1", () => {
      beforeEach(async () => {
        await act(async () => {
          userEvent.type(
            screen.getByLabelText("Street address 1", { exact: false }),
            "111 greendale dr,"
          );
        });
        await act(async () => {
          userEvent.click(screen.getByText("Submit"));
        });
      });
      it("shows an error", () => {
        expect(
          screen.getByText("A valid street address is required")
        ).toBeInTheDocument();
      });
    });
    describe("On clicking an invalid date of birth and submitting", () => {
      beforeEach(async () => {
        userEvent.click(screen.getByTestId("date-picker-button"));
        const nextMonthButton = screen.getByTestId("next-month");
        expect(nextMonthButton).toHaveClass(
          "usa-date-picker__calendar__next-month"
        );
        userEvent.click(nextMonthButton);
        const dateButton = screen.getByText("15");
        expect(dateButton).toHaveClass("usa-date-picker__calendar__date");
        userEvent.click(dateButton);
        await act(async () => {
          userEvent.click(screen.getByText("Submit"));
        });
      });
      it("shows an error", () => {
        expect(
          screen.getByText("A valid date of birth is required")
        ).toBeInTheDocument();
      });
    });
    describe("On clicking a valid date of birth and submitting", () => {
      beforeEach(async () => {
        userEvent.click(screen.getByTestId("date-picker-button"));
        const previousMonthButton = screen.getByTestId("previous-month");
        expect(previousMonthButton).toHaveClass(
          "usa-date-picker__calendar__previous-month"
        );
        userEvent.click(previousMonthButton);
        const dateButton = screen.getByText("15");
        expect(dateButton).toHaveClass("usa-date-picker__calendar__date");
        userEvent.click(dateButton);
        await act(async () => {
          userEvent.click(screen.getByText("Submit"));
        });
      });
      it("shows an error", () => {
        expect(
          screen.queryByText("A valid date of birth is required")
        ).not.toBeInTheDocument();
      });
    });
    describe("On submitting an invalid street address 2", () => {
      beforeEach(async () => {
        await act(async () => {
          userEvent.type(
            screen.getByLabelText("Street address 2", { exact: false }),
            "111 greendale dr,"
          );
        });
        await act(async () => {
          userEvent.click(screen.getByText("Submit"));
        });
      });
      it("shows an error", () => {
        expect(
          screen.getByText("Street 2 contains invalid symbols")
        ).toBeInTheDocument();
      });
    });
    describe("On submitting an invalid zip code", () => {
      beforeEach(async () => {
        await act(async () => {
          userEvent.type(
            screen.getByLabelText("ZIP code", { exact: false }),
            "1234"
          );
        });
        await act(async () => {
          userEvent.click(screen.getByText("Submit"));
        });
      });
      it("shows an error", () => {
        expect(
          screen.getByText("A valid ZIP code is required")
        ).toBeInTheDocument();
      });
    });
    describe("On submitting an incomplete form", () => {
      beforeEach(async () => {
        await act(async () => {
          fillInText("Email", "bob@bob.bob");
          userEvent.click(screen.getByText("Submit"));
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
      userEvent.click(screen.getByTestId("date-picker-button"));
      const dateButton = screen.getByText("15");
      expect(dateButton).toHaveClass("usa-date-picker__calendar__date");
      userEvent.click(dateButton);
      fillInText("Email", "bob@bob.bob");
      fillInText("Phone number", "530-867-5309");
      fillInText("Street address 1", "123 Bob St");
      fillInText("City", "Bobtown");
      fillInText("State", "CA");
      fillInText("ZIP code", "74783");
    });

    describe("On submit", () => {
      beforeEach(async () => {
        await act(async () => {
          userEvent.click(screen.getByText("Submit"));
        });
      });
      it("does not shows an error", () => {
        expect(screen.queryAllByText("is required").length).toBe(0);
      });
    });
  });
});
