import { render, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import userEvent, { UserEvent } from "@testing-library/user-event";

import CreateUserForm from "./CreateUserForm";

const mockStore = configureStore([]);
const store = mockStore({
  facilities: [
    { id: "1", name: "Gabagool facility" },
    { id: "2", name: "A+ Facility" },
  ],
});
let mockOnClose = jest.fn();
let mockOnSubmit = jest.fn();
describe("CreateUserForm", () => {
  const renderWithUser = () => ({
    user: userEvent.setup(),
    ...render(
      <Provider store={store}>
        <MockedProvider>
          <CreateUserForm
            onSubmit={mockOnSubmit}
            onClose={mockOnClose}
            isUpdating={false}
          />
        </MockedProvider>
      </Provider>
    ),
  });

  describe("Validation", () => {
    it("All fields are validated", async () => {
      const { user } = renderWithUser();

      await user.selectOptions(
        screen.getByLabelText("Access level *"),
        "ENTRY_ONLY"
      );
      await user.click(screen.getByText("Send invite"));

      await waitFor(() => screen.findByText("First name is required"));
      expect(screen.getByText("Last name is required")).toBeInTheDocument();
      expect(screen.getByText("Email address is required")).toBeInTheDocument();
      expect(
        screen.getByText("At least one facility must be selected")
      ).toBeInTheDocument();
    });
    it("Email is validated for format", async () => {
      const { user } = renderWithUser();
      await user.type(screen.getByLabelText("Email address *"), "JonDoe");
      await user.click(screen.getByText("Send invite"));

      await waitFor(() => {
        expect(
          screen.getByText("Email address must be a valid email address")
        ).toBeInTheDocument();
      });
    });
    it("Testing facility access errors get cleared when access level is selected", async () => {
      const { user } = renderWithUser();
      await user.selectOptions(
        screen.getByLabelText("Access level *"),
        "ENTRY_ONLY"
      );
      await user.click(screen.getByText("Send invite"));
      await waitFor(() =>
        screen.findByText("At least one facility must be selected")
      );

      await user.selectOptions(
        screen.getByLabelText("Access level *"),
        "ADMIN"
      );
      expect(
        screen.queryByText("At least one facility must be selected")
      ).not.toBeInTheDocument();
    });
  });
  describe("Close", () => {
    it("Clicking `Go back` runs the onClose", async () => {
      const { user } = renderWithUser();
      await user.click(screen.getByText("Go back"));
      expect(mockOnClose).toBeCalledTimes(1);
    });
    it("Clicking `X` runs the onClose", async () => {
      const { user } = renderWithUser();
      await user.click(screen.getByLabelText("Close"));
      expect(mockOnClose).toBeCalledTimes(1);
    });
  });
  describe("On submit", () => {
    const fillForm = async (user: UserEvent) => {
      await user.type(screen.getByLabelText("First name *"), "Billy");
      await user.type(screen.getByLabelText("Last name *"), "Thorton");
      await user.click(screen.getByLabelText("Gabagool facility"));
      await user.type(
        screen.getByLabelText("Email address *"),
        "BillyBob@example.com"
      );
    };

    it("Admin user role", async () => {
      const { user } = renderWithUser();
      await fillForm(user);
      await user.selectOptions(
        screen.getByLabelText("Access level *"),
        "ADMIN"
      );
      await user.click(screen.getByText("Send invite"));

      await waitFor(() => expect(mockOnSubmit).toBeCalledTimes(1));
      expect(mockOnSubmit).toBeCalledWith(
        expect.objectContaining({
          organization: {
            testingFacility: [
              {
                id: "1",
                name: "Gabagool facility",
              },
              {
                id: "2",
                name: "A+ Facility",
              },
            ],
          },
          permissions: ["ACCESS_ALL_FACILITIES"],
          role: "ADMIN",
        })
      );
    });
    it("Standard user with access to all facilities", async () => {
      const { user } = renderWithUser();
      await fillForm(user);
      await user.click(screen.getByLabelText("Access all facilities (2)"));
      await user.click(screen.getByText("Send invite"));

      await waitFor(() => expect(mockOnSubmit).toBeCalledTimes(1));
      expect(mockOnSubmit).toBeCalledWith(
        expect.objectContaining({
          organization: {
            testingFacility: [
              {
                id: "2",
                name: "A+ Facility",
              },
              {
                id: "1",
                name: "Gabagool facility",
              },
            ],
          },
          permissions: ["ACCESS_ALL_FACILITIES"],
        })
      );
    });

    it("Standard user with one facility", async () => {
      const { user } = renderWithUser();
      await fillForm(user);
      await user.click(screen.getByText("Send invite"));

      await waitFor(() => expect(mockOnSubmit).toBeCalledTimes(1));
      expect(mockOnSubmit).toBeCalledWith({
        email: "BillyBob@example.com",
        facilityIds: ["1"],
        firstName: "Billy",
        lastName: "Thorton",
        organization: {
          testingFacility: [
            {
              id: "1",
              name: "Gabagool facility",
            },
          ],
        },
        permissions: [],
        role: "USER",
      });
    });
  });
});
