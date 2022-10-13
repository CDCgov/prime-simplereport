import { render, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

import {
  AddUserDocument,
  GetOrganizationsDocument,
  Role,
} from "../../../generated/graphql";
import * as srToast from "../../utils/srToast";

import AddOrganizationAdminFormContainer from "./AddOrganizationAdminFormContainer";

const organizationsQuery = {
  request: {
    query: GetOrganizationsDocument,
    variables: {
      identityVerified: true,
    },
  },
  result: {
    data: {
      organizations: [
        {
          externalId: "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0",
          name: "Space Camp",
        },
        {
          externalId: "DC-Space-Camp-h3781038-b4c5-449f-98b0-2e02abb7aae0",
          name: "Space Camp 2",
        },
      ],
    },
  },
};

const addAdminMutation = {
  request: {
    query: AddUserDocument,
    variables: {
      organizationExternalId:
        "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0",
      role: Role.Admin,
      firstName: "Flora",
      middleName: "",
      lastName: "Murray",
      suffix: "",
      email: "Flora.Murray@example.com",
    },
  },
  result: {
    data: {
      addUser: {
        id: "c912d4d4-cbe6-4d80-9d24-c14ba1f7f180",
      },
    },
  },
};

jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    Navigate: () => <p>Redirected</p>,
  };
});

function renderView() {
  return render(
    <MemoryRouter>
      {" "}
      <MockedProvider mocks={[organizationsQuery, addAdminMutation]}>
        <AddOrganizationAdminFormContainer />
      </MockedProvider>
    </MemoryRouter>
  );
}

const waitForOrgLoadReturnTitle = async () => {
  return await waitFor(() => {
    return screen.getByText("Add organization admin", { exact: false });
  });
};

const selectOrg = () => {
  // using the default test id that comes with the trusswork component
  userEvent.click(screen.getByTestId("combo-box-select"));
  userEvent.click(
    screen.getByTestId(
      "combo-box-option-DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0"
    )
  );
};

describe("when loading orgs", () => {
  it("tells the user the orgs are loading", () => {
    renderView();
    expect(
      screen.getByText("Loading Organizations", { exact: false })
    ).toBeInTheDocument();
  });
});

describe("after loading orgs", () => {
  it("displays the form title ", async () => {
    renderView();
    let title = await waitForOrgLoadReturnTitle();
    expect(title).toBeInTheDocument();
  });

  it("disables the save button", async () => {
    renderView();
    await waitForOrgLoadReturnTitle();
    expect(screen.getByText("Save Changes", { exact: false })).toBeDisabled();
  });
});

describe("form validation", () => {
  it("shows an inline error when having a blank first name", async () => {
    renderView();
    await waitForOrgLoadReturnTitle();
    const firstName = screen.getByLabelText("First name", {
      exact: false,
    });
    userEvent.clear(firstName);
    userEvent.tab();
    expect(
      await screen.findByText("First name is missing", { exact: false })
    ).toBeInTheDocument();
  });
});

describe("unsuccessful form submission", () => {
  it("toggles the save button when selecting organization", async () => {
    renderView();
    await waitForOrgLoadReturnTitle();
    selectOrg();
    expect(screen.getByText("Save Changes", { exact: false })).toBeEnabled();
    userEvent.click(screen.getByTestId("combo-box-clear-button"));
    expect(screen.getByText("Save Changes", { exact: false })).toBeDisabled();
  });

  it("displays an error when there are form errors", async () => {
    let alertSpy: jest.SpyInstance = jest.spyOn(srToast, "showError");
    renderView();
    await waitForOrgLoadReturnTitle();
    selectOrg();
    userEvent.click(screen.getByText("Save Changes"));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Please check the form to make sure you complete all of the required fields.",
        "Form Errors"
      );
    });
  });
});

describe("successful form submission", () => {
  it("redirects the user", async () => {
    let alertSpy: jest.SpyInstance = jest.spyOn(srToast, "showSuccess");
    renderView();
    await waitForOrgLoadReturnTitle();
    selectOrg();
    userEvent.type(
      screen.getByLabelText("First name", { exact: false }),
      "Flora"
    );
    userEvent.type(
      screen.getByLabelText("Last name", { exact: false }),
      "Murray"
    );
    userEvent.type(
      screen.getByLabelText("Email", { exact: false }),
      "Flora.Murray@example.com"
    );
    expect(screen.getByText("Save Changes", { exact: false })).toBeEnabled();
    expect(screen.getByTestId("combo-box-input")).toHaveValue("Space Camp");
    userEvent.click(screen.getByText("Save Changes"));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "The organization admin has been added",
        "Added Organization Admin"
      );
    });
    expect(await screen.findByText("Redirected")).toBeInTheDocument();
  });
});
