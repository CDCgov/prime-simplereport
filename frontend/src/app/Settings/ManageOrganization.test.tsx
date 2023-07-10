import { MockedProvider } from "@apollo/client/testing";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { DeepPartial } from "redux";
import configureStore from "redux-mock-store";

import { RootState } from "../store";
import * as SRToast from "../utils/srToast";
import {
  AdminSetOrganizationDocument,
  GetCurrentOrganizationDocument,
  SetOrganizationDocument,
} from "../../generated/graphql";

import ManageOrganizationContainer from "./ManageOrganizationContainer";

const mockStore = configureStore<DeepPartial<RootState>>([]);

describe("ManageOrganization", () => {
  const adminStore = mockStore({ user: { isAdmin: true } });

  let showSuccessSpy: jest.SpyInstance;

  beforeAll(() => {
    showSuccessSpy = jest.spyOn(SRToast, "showSuccess");
  });

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

      expect(orgNameInput).toBeEnabled();
      fireEvent.change(orgNameInput, { target: { value: "Penny Lane" } });
      fireEvent.change(orgTypeInput, { target: { value: "other" } });

      const saveButton = screen.getByText("Save settings");
      expect(saveButton).toBeEnabled();
      fireEvent.click(saveButton);
      await waitFor(() =>
        expect(showSuccessSpy).toHaveBeenCalledWith(
          "The settings for the organization have been updated",
          "Updated organization"
        )
      );
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

      fireEvent.change(orgTypeInput, { target: { value: "hospice" } });

      const saveButton = screen.getByText("Save settings");
      expect(saveButton).toBeEnabled();
      fireEvent.click(saveButton);
      await waitFor(() =>
        expect(showSuccessSpy).toHaveBeenCalledWith(
          "The settings for the organization have been updated",
          "Updated organization"
        )
      );
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
      fireEvent.change(screen.getByLabelText(/organization name \*/i), {
        target: { value: "" },
      });

      const saveButton = screen.getByText("Save settings");
      expect(saveButton).toBeEnabled();
      fireEvent.click(saveButton);

      await waitFor(() =>
        expect(screen.getByLabelText("Organization name *")).toHaveFocus()
      );
      expect(
        screen.getByText("The organization's name cannot be blank")
      ).toBeInTheDocument();
      expect(
        screen.getByText("An organization type must be selected")
      ).toBeInTheDocument();
    });

    it("detects dirty state after first org data update", async () => {
      render(
        <Provider store={adminStore}>
          <MockedProvider
            mocks={[
              mocks[0],
              {
                request: {
                  query: AdminSetOrganizationDocument,
                  variables: {
                    name: "Strawberry Fields 2",
                    type: "camp",
                  },
                },
                result: {
                  data: {
                    adminUpdateOrganization: null,
                  },
                },
              },
            ]}
          >
            <ManageOrganizationContainer />
          </MockedProvider>
        </Provider>
      );

      // Updates the form
      await waitForElementToBeRemoved(screen.queryByText(/loading\.\.\./i));
      fireEvent.change(screen.getByLabelText(/organization type \*/i), {
        target: { value: "camp" },
      });
      fireEvent.change(screen.getByLabelText(/organization name \*/i), {
        target: { value: "Strawberry Fields 2" },
      });
      const saveButton = screen.getByText("Save settings");
      expect(saveButton).toBeEnabled();
      fireEvent.click(saveButton);
      await waitFor(() =>
        expect(showSuccessSpy).toHaveBeenCalledWith(
          "The settings for the organization have been updated",
          "Updated organization"
        )
      );
      expect(saveButton).toBeDisabled();

      // checks that the form validation properly handles isDirty check
      fireEvent.change(screen.getByLabelText(/organization name \*/i), {
        target: { value: "Strawberry Fields 3" },
      });
      await waitFor(() => expect(saveButton).toBeEnabled());
      fireEvent.change(screen.getByLabelText(/organization name \*/i), {
        target: { value: "Strawberry Fields 2" },
      });
      await waitFor(() => expect(saveButton).toBeDisabled());
    });
  });
});

const mocks = [
  {
    request: {
      query: GetCurrentOrganizationDocument,
    },
    result: {
      data: {
        whoami: {
          organization: {
            name: "Strawberry Fields",
          },
        },
      },
    },
  },
  {
    request: {
      query: AdminSetOrganizationDocument,
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
      query: SetOrganizationDocument,
      variables: {
        type: "hospice",
      },
    },
    result: {
      data: { updateOrganization: null },
    },
  },
];
