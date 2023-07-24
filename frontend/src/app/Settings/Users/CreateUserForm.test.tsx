import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import userEvent from "@testing-library/user-event";

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
  beforeEach(() => {
    render(
      <Provider store={store}>
        <MockedProvider>
          <CreateUserForm
            onSubmit={mockOnSubmit}
            onClose={mockOnClose}
            isUpdating={false}
          />
        </MockedProvider>
      </Provider>
    );
  });
  describe("Validation", () => {
    it("All fields are validated", async () => {
      fireEvent.change(screen.getByLabelText("Access level *"), {
        target: { value: "ENTRY_ONLY" },
      });
      fireEvent.click(screen.getByText("Send invite"));

      await waitFor(() => screen.findByText("First name is required"));
      expect(screen.getByText("Last name is required")).toBeInTheDocument();
      expect(screen.getByText("Email address is required")).toBeInTheDocument();
      expect(
        screen.getByText("At least one facility must be selected")
      ).toBeInTheDocument();
    });
    it("Email is validated for format", async () => {
      fireEvent.change(screen.getByLabelText("Email address *"), {
        target: { value: "JonDoe" },
      });
      fireEvent.click(screen.getByText("Send invite"));

      await waitFor(() => {
        expect(
          screen.getByText("Email address must be a valid email address")
        ).toBeInTheDocument();
      });
    });
    it("Testing facility access errors get cleared when access level is selected", async () => {
      fireEvent.change(screen.getByLabelText("Access level *"), {
        target: { value: "ENTRY_ONLY" },
      });
      fireEvent.click(screen.getByText("Send invite"));
      await waitFor(() =>
        screen.findByText("At least one facility must be selected")
      );

      fireEvent.change(screen.getByLabelText("Access level *"), {
        target: { value: "ADMIN" },
      });
      expect(
        screen.queryByText("At least one facility must be selected")
      ).not.toBeInTheDocument();
    });
  });
  describe("Close", () => {
    it("Clicking `Go back` runs the onClose", () => {
      fireEvent.click(screen.getByText("Go back"));
      expect(mockOnClose).toBeCalledTimes(1);
    });
    it("Clicking `X` runs the onClose", async () => {
      await act(
        async () => await userEvent.click(screen.getByLabelText("Close"))
      );
      expect(mockOnClose).toBeCalledTimes(1);
    });
  });
  describe("On submit", () => {
    const fillForm = () => {
      fireEvent.change(screen.getByLabelText("First name *"), {
        target: { value: "Billy" },
      });
      fireEvent.change(screen.getByLabelText("Last name *"), {
        target: { value: "Thorton" },
      });
      fireEvent.click(screen.getByLabelText("Gabagool facility"));
      fireEvent.change(screen.getByLabelText("Email address *"), {
        target: { value: "BillyBob@example.com" },
      });
    };

    it("Admin user role", async () => {
      fillForm();
      fireEvent.change(screen.getByLabelText("Access level *"), {
        target: { value: "ADMIN" },
      });
      fireEvent.click(screen.getByText("Send invite"));

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
      fillForm();
      fireEvent.click(screen.getByLabelText("Access all facilities (2)"));
      fireEvent.click(screen.getByText("Send invite"));

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
      fillForm();
      fireEvent.click(screen.getByText("Send invite"));

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
