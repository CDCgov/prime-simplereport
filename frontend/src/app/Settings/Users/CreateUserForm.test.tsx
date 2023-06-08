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
import { SettingsUser } from "./ManageUsersContainer";

const mockStore = configureStore([]);
const store = mockStore({
  facilities: [
    { id: "1", name: "Facility 1" },
    { id: "2", name: "Facility 2" },
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
            onSubmit={(input: Partial<SettingsUser>) => {}}
            onClose={mockOnClose}
          />
        </MockedProvider>
      </Provider>
    );
  });
  describe("Validation", () => {
    it("All fields are validated", async () => {
      fireEvent.click(screen.getByLabelText("Facility 1"));
      fireEvent.click(screen.getByLabelText("Facility 1"));
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
});
