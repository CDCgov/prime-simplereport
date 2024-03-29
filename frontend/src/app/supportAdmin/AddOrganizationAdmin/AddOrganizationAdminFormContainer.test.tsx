import { render, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import selectEvent from "react-select-event";
import userEvent from "@testing-library/user-event";

import {
  AddUserDocument,
  GetOrganizationsDocument,
  Role,
} from "../../../generated/graphql";
import * as srToast from "../../utils/srToast";
import { addOrgAdminPageTitle } from "../pageTitles";

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

const mockFacility: any = {
  id: "12345",
};

jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    Navigate: () => <p>Redirected</p>,
  };
});
jest.mock("../../facilitySelect/useSelectedFacility", () => {
  return {
    useSelectedFacility: () => {
      return [mockFacility, () => {}];
    },
  };
});

function renderView() {
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter>
        {" "}
        <MockedProvider mocks={[organizationsQuery, addAdminMutation]}>
          <AddOrganizationAdminFormContainer />
        </MockedProvider>
      </MemoryRouter>
    ),
  };
}

const waitForOrgLoadReturnTitle = async () => {
  return await waitFor(() => {
    return screen.getByText(addOrgAdminPageTitle, { exact: false });
  });
};

const selectOrg = async () => {
  await selectEvent.select(
    screen.getByLabelText(/organization/i),
    "Space Camp"
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
    expect(await waitForOrgLoadReturnTitle()).toBeInTheDocument();
  });

  it("disables the save button", async () => {
    renderView();
    await waitForOrgLoadReturnTitle();
    expect(screen.getByText("Save Changes", { exact: false })).toBeDisabled();
  });
});

describe("unsuccessful form submission", () => {
  it("toggles the save button when selecting organization", async () => {
    renderView();
    await waitForOrgLoadReturnTitle();
    await selectOrg();
    expect(screen.getByText("Save Changes", { exact: false })).toBeEnabled();
  });

  it("displays an error when there are form errors", async () => {
    const { user } = renderView();
    await waitForOrgLoadReturnTitle();
    await selectOrg();
    await user.click(screen.getByText("Save Changes"));
    await waitFor(async () => {
      expect(screen.getByText("First name is missing")).toBeInTheDocument();
    });
    expect(screen.getByText("Last name is missing")).toBeInTheDocument();
    expect(screen.getByText("Email is missing")).toBeInTheDocument();
    expect(screen.getByLabelText("First name *")).toHaveFocus();
  });

  it("displays an error when no organization is selected", async () => {
    const { user } = renderView();
    await waitForOrgLoadReturnTitle();
    await user.type(
      screen.getByLabelText("First name", { exact: false }),
      "Flora"
    );
    await user.click(screen.getByText("Save Changes"));
    await waitFor(async () => {
      expect(screen.getByText("Organization is missing")).toBeInTheDocument();
    });
    expect(screen.getByTestId("combo-box-input")).toHaveFocus();
  });

  it("displays an error with invalid email", async () => {
    const { user } = renderView();
    await waitForOrgLoadReturnTitle();
    await user.type(screen.getByLabelText("Email *"), "Flora");
    await user.click(screen.getByText("Save Changes"));
    await waitFor(async () => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });
  });
});

describe("successful form submission", () => {
  it("redirects the user", async () => {
    let alertSpy: jest.SpyInstance = jest.spyOn(srToast, "showSuccess");
    const { user } = renderView();
    await waitForOrgLoadReturnTitle();
    await selectOrg();
    await user.type(
      screen.getByLabelText("First name", { exact: false }),
      "Flora"
    );
    await user.type(
      screen.getByLabelText("Last name", { exact: false }),
      "Murray"
    );
    await user.type(
      screen.getByLabelText("Email", { exact: false }),
      "Flora.Murray@example.com"
    );
    expect(screen.getByText("Save Changes", { exact: false })).toBeEnabled();
    expect(screen.getByTestId("combo-box-input")).toHaveValue("Space Camp");
    await user.click(screen.getByText("Save Changes"));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "The organization admin has been added",
        "Added Organization Admin"
      );
    });
    expect(await screen.findByText("Redirected")).toBeInTheDocument();
  });
});
