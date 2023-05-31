import { MockedProvider } from "@apollo/client/testing";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
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
  const adminStore = mockStore({ user: { isAdmin: true } });

  describe("Displays right content depending on user role", () => {
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
      render(
        <Provider store={adminStore}>
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
      await userEvent.type(orgNameInput, "Penny Lane");
      await userEvent.selectOptions(orgTypeInput, "other");
      expect(saveButton).toBeEnabled();
      await userEvent.click(saveButton);
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
      await userEvent.selectOptions(orgTypeInput, "hospice");
      expect(saveButton).toBeEnabled();
      await userEvent.click(saveButton);
    });
  });

  describe("Validates form data", function () {
    it("checks error messages", async () => {
      render(
        <Provider store={adminStore}>
          <MockedProvider mocks={mocks}>
            <ManageOrganizationContainer />
          </MockedProvider>
        </Provider>
      );

      await waitForElementToBeRemoved(screen.queryByText(/loading\.\.\./i));
      await userEvent.clear(screen.getByLabelText(/organization name \*/i));

      const saveButton = screen.getByText("Save settings");
      expect(saveButton).toBeEnabled();
      await userEvent.click(saveButton);

      await waitFor(() =>
        expect(screen.queryByText(/The organization's name cannot be blank/i))
      );
      expect(screen.queryByText(/An organization type must be selected/i));
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
