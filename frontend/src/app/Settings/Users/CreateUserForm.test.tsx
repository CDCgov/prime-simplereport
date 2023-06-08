import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import CreateUserForm from "./CreateUserForm";

const mockStore = configureStore([]);
const store = mockStore({
  facilities: [
    { id: "1", name: "Facility 1" },
    { id: "2", name: "Facility 2" },
  ],
});

describe("CreateUserForm", () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <MockedProvider>
          <CreateUserForm onSubmit={() => {}} onClose={() => {}} />
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
});
