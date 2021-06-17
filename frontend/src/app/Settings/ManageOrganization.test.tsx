import { MockedProvider } from "@apollo/client/testing";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { DeepPartial } from "redux";
import configureStore from "redux-mock-store";

import { RootState } from "../store";

import ManageOrganizationContainer, {
  GET_ORGANIZATION,
  SET_ORGANIZATION,
} from "./ManageOrganizationContainer";

const mockStore = configureStore<DeepPartial<RootState>>([]);

describe("ManageOrganization", () => {
  it("does not allow org name change for regular admins", async () => {
    const store = mockStore({
      user: {
        isAdmin: false,
      },
    });
    render(
      <Provider store={store}>
        <MockedProvider mocks={mocks}>
          <ManageOrganizationContainer />
        </MockedProvider>
      </Provider>
    );
    const saveButton = await screen.findByText("Save settings");
    expect(
      screen.queryByLabelText("Organization name", {
        exact: false,
      })
    ).not.toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it("allows org name change for super admins", async () => {
    const store = mockStore({
      user: {
        isAdmin: true,
      },
    });
    render(
      <Provider store={store}>
        <MockedProvider mocks={mocks}>
          <ManageOrganizationContainer />
        </MockedProvider>
      </Provider>
    );
    const orgNameInput = await screen.findByLabelText("Organization name", {
      exact: false,
    });
    const saveButton = screen.getByText("Save settings");
    expect(orgNameInput).not.toBeDisabled();
    fireEvent.change(orgNameInput, { target: { value: "Penny Lane" } });
    expect(saveButton).not.toBeDisabled();
    await waitFor(() => {
      fireEvent.click(saveButton);
    });
  });
});

const mocks = [
  {
    request: {
      query: GET_ORGANIZATION,
    },
    result: {
      data: {
        organization: {
          name: "Strawberry Fields",
        },
      },
    },
  },
  {
    request: {
      query: SET_ORGANIZATION,
      variables: {
        name: "Penny Lane",
      },
    },
    result: {
      data: {
        updatedOrganization: null,
      },
    },
  },
];
