import { render, screen, waitFor } from "@testing-library/react";
import ReactDOM from "react-dom";
import { MockedProvider } from "@apollo/client/testing";
import userEvent from "@testing-library/user-event";

import { ArchivePersonDocument } from "../../generated/graphql";
import * as srToast from "../utils/srToast";

import { Patient } from "./ManagePatients";
import ArchivePersonModal from "./ArchivePersonModal";

const mockPerson: Patient = {
  internalId: "7b968f75-e2fb-43a5-ae8b-c7e0f4873d3a",
  firstName: "Guy",
  lastName: "Abramcik",
  middleName: "Christine Michael",
  birthDate: "1992-11-26",
  isDeleted: false,
  role: "STAFF",
  lastTest: {
    dateAdded: "2022-01-06 13:56:20.255",
    result: "",
    dateTested: "2022-01-07 13:56:20.255",
    deviceTypeModel: "",
    deviceTypeName: "",
    facilityName: "",
  },
};

const archivePersonMutation = {
  request: {
    query: ArchivePersonDocument,
    variables: {
      id: "7b968f75-e2fb-43a5-ae8b-c7e0f4873d3a",
      deleted: true,
    },
  },
  result: {
    data: {
      setPatientIsDeleted: {
        internalId: "c912d4d4-cbe6-4d80-9d24-c14ba1f7f180",
        deleted: true,
      },
    },
  },
};

const setup = () => {
  ReactDOM.createPortal = jest.fn((element, _node) => {
    return element;
  }) as any;
  return render(
    <MockedProvider mocks={[archivePersonMutation]}>
      <ArchivePersonModal person={mockPerson} closeModal={() => {}} />
    </MockedProvider>
  );
};

describe("ArchivePersonModal", () => {
  it("contains the defaults", async () => {
    let view = setup();
    expect(
      await screen.findByText("Abramcik, Guy Christine Michael")
    ).toBeInTheDocument();
    expect(view).toMatchSnapshot();
  });

  it("shows a success message when archiving", async () => {
    let alertSpy: jest.SpyInstance = jest.spyOn(srToast, "showSuccess");
    setup();
    userEvent.click(screen.getByText("Yes, I'm sure"));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("", "Record archived");
    });
  });
});
