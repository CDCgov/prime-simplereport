import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { DeepPartial } from "redux";
import configureStore from "redux-mock-store";

import { RootState } from "../store";

import ManageOrganizationContainer, {
  GET_ORGANIZATION,
  SET_ORGANIZATION,
  ADMIN_SET_ORGANIZATION,
} from "./ManageOrganizationContainer";

const mockStore = configureStore<DeepPartial<RootState>>([]);

describe("ManageOrganization", () => {
  it("does not allow org name change for regular admins", async () => {
    const store = mockStore({ user: { isAdmin: false } });
    render(
      <Provider store={store}>
        <MockedProvider mocks={mocks}>
          <ManageOrganizationContainer />
        </MockedProvider>
      </Provider>
    );
    const saveButton = await screen.findByText("Save settings");
    await screen.findByText(
      /the organization name is used for reporting to public health departments\. please contact if you need to change it\./i
    );
    expect(
      screen.queryByRole("textbox", { name: /organization name required/i })
    ).not.toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });
  it("allows org name and type change for super admins", async () => {
    const store = mockStore({ user: { isAdmin: true } });
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
    const orgTypeInput = await screen.findByLabelText("Organization type", {
      exact: false,
    });
    const saveButton = screen.getByText("Save settings");
    expect(orgNameInput).toBeEnabled();
    userEvent.type(orgNameInput, "Penny Lane");
    userEvent.selectOptions(orgTypeInput, "other");
    expect(saveButton).toBeEnabled();
    userEvent.click(saveButton);
  });

  it("allows org type change for regular admins", async () => {
    const store = mockStore({ user: { isAdmin: false } });
    render(
      <Provider store={store}>
        <MockedProvider mocks={mocks}>
          <ManageOrganizationContainer />
        </MockedProvider>
      </Provider>
    );
    const orgTypeInput = await screen.findByLabelText("Organization type", {
      exact: false,
    });
    const saveButton = screen.getByText("Save settings");
    userEvent.selectOptions(orgTypeInput, "hospice");
    expect(saveButton).toBeEnabled();
    userEvent.click(saveButton);
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
      query: ADMIN_SET_ORGANIZATION,
      variables: {
        name: "Penny Lane",
        type: "other",
      },
    },
    result: {
      data: {
        adminUpdateOrganization: null,
      },
    },
  },
  {
    request: {
      query: SET_ORGANIZATION,
      variables: {
        type: "hospice",
      },
    },
  },
];
