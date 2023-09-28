import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PersonalDetailsForm from "./PersonalDetailsForm";

window.scrollTo = jest.fn();

const fillInText = (label: string, text: string) => {
  fireEvent.change(screen.getByLabelText(label, { exact: false }), {
    target: { value: text },
  });
};

describe("PersonalDetailsForm", () => {
  const renderWithUser = () => ({
    user: userEvent.setup(),
    ...render(
      <PersonalDetailsForm
        orgExternalId="foo"
        firstName={"Bob"}
        middleName={"Rob"}
        lastName={"Bobberton"}
      />
    ),
  });
  it("displays the users full name", () => {
    renderWithUser();
    expect(screen.getByText("Bob Rob Bobberton")).toBeInTheDocument();
  });

  it("initializes with the submit button disabled", () => {
    renderWithUser();
    expect(screen.getByText("Submit")).toBeDisabled();
  });

  describe("Filling out the form", () => {
    const renderAndTypeEmail = async () => {
      const { user, ...renderControls } = renderWithUser();
      await user.click(screen.getByLabelText("Email *", { exact: false }));
      await user.paste("bob@bob.bob");
      return { user, ...renderControls };
    };

    it("enables the submit button", async () => {
      await renderAndTypeEmail();
      expect(screen.getByText("Submit")).toBeEnabled();
    });
    describe("focusing and not adding a value", () => {
      it("shows a single error", async () => {
        await renderAndTypeEmail();
        screen.getByLabelText("Phone number *", { exact: false }).focus();
        screen.getByLabelText("Street address 1", { exact: false }).focus();
        expect(
          await screen.findByText("A valid phone number is required")
        ).toBeInTheDocument();
      });
    });
    describe("On submitting with an invalid phone number", () => {
      it("shows an error", async () => {
        const { user } = await renderAndTypeEmail();

        await user.type(
          screen.getByLabelText("Phone number", { exact: false }),
          "123"
        );
        await user.click(screen.getByText("Submit"));
        expect(
          await screen.findByText("A valid phone number is required")
        ).toBeInTheDocument();
        expect(
          screen.getByLabelText("Date of birth", { exact: false })
        ).toHaveFocus();
      });
    });
    describe("On submitting an invalid street address 1", () => {
      it("shows an error", async () => {
        const { user } = await renderAndTypeEmail();
        await user.click(
          screen.getByLabelText("Street address 1", { exact: false })
        );
        await user.paste("111 greendale dr,");
        await user.click(screen.getByText("Submit"));
        expect(
          await screen.findByText("A valid street address is required")
        ).toBeInTheDocument();
      });
    });
    describe("On entering an invalid date of birth and submitting", () => {
      it("shows an error", async () => {
        const { user } = await renderAndTypeEmail();
        await user.click(
          screen.getByLabelText("Date of birth", { exact: false })
        );
        await user.paste("01/01/9999");
        await user.click(screen.getByText("Submit"));
        expect(
          await screen.findByText("A valid date of birth is required")
        ).toBeInTheDocument();
      });
    });
    describe("On clicking a valid date of birth and submitting", () => {
      it("shows an error", async () => {
        const { user } = await renderAndTypeEmail();
        await user.click(screen.getByLabelText(/Date of birth/i));
        await user.paste("09/15/2022");
        await user.click(screen.getByText("Submit"));
        await waitFor(() =>
          expect(screen.queryByText("A valid date of birth is required"))
        );
      });
    });
    describe("On submitting an invalid street address 2", () => {
      it("shows an error", async () => {
        const { user } = await renderAndTypeEmail();
        await user.click(
          screen.getByLabelText("Street address 2", { exact: false })
        );
        await user.paste("111 greendale dr,");
        await user.click(screen.getByText("Submit"));
        expect(
          await screen.findByText("Street 2 contains invalid symbols")
        ).toBeInTheDocument();
      });
    });
    describe("On submitting an invalid zip code", () => {
      it("shows an error", async () => {
        const { user } = await renderAndTypeEmail();
        await user.click(screen.getByLabelText("ZIP code", { exact: false }));
        await user.paste("1234");
        await user.click(screen.getByText("Submit"));
        expect(
          await screen.findByText("A valid ZIP code is required")
        ).toBeInTheDocument();
      });
    });
    describe("On submitting an incomplete form", () => {
      it("shows an error", async () => {
        const { user } = await renderAndTypeEmail();
        fillInText("Email", "bob@bob.bob");
        await user.click(screen.getByText("Submit"));
        await waitFor(() => {
          expect(
            screen.queryAllByText("is required", { exact: false }).length
          ).toBe(6);
        });
      });
    });
  });

  describe("Completed form", () => {
    describe("On submit", () => {
      it("does not shows an error", async () => {
        const { user } = renderWithUser();
        fillInText("Date of birth", "09/15/2022");
        fillInText("Email", "bob@bob.bob");
        fillInText("Phone number", "530-867-5309");
        fillInText("Street address 1", "123 Bob St");
        fillInText("City", "Bobtown");
        fillInText("State", "CA");
        fillInText("ZIP code", "74783");
        await user.click(screen.getByText("Submit"));
        await waitFor(() => {
          expect(screen.queryAllByText("is required").length).toBe(0);
        });
      });
    });
  });
});
