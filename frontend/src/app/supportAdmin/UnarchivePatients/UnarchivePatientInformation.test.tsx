import React from "react";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { UnarchivePatientState } from "./UnarchivePatient";
import UnarchivePatientInformation from "./UnarchivePatientInformation";
import {
  checkPatientResultRows,
  mockFacility1,
  mockFacility2,
  mockOrg1,
  mockPatient1,
  mockPatient2,
} from "./UnarchivePatient.test";

const mockNavigate = jest.fn();
const mockLocation = jest.fn();

jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

describe("unarchive patient information", () => {
  let handlePaginationClick: jest.Mock;

  beforeEach(() => {
    handlePaginationClick = jest.fn();
  });

  it("displays instructions on initial state", async () => {
    let unarchivePatientState: UnarchivePatientState = {
      pageUrl: "/admin/unarchive-patient",
      entriesPerPage: 20,
      orgId: "",
      facilityId: "",
      patientsCount: undefined,
      patients: undefined,
      facilities: [],
    };
    render(
      <MemoryRouter>
        <UnarchivePatientInformation
          unarchivePatientState={unarchivePatientState}
          currentPage={1}
          loading={false}
          handlePaginationClick={handlePaginationClick}
        />
      </MemoryRouter>
    );
    expect(screen.queryByText(`Archived patients`)).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Filter by organization and testing facility to display archived patients."
      )
    );
  });

  it("displays loading message if patients are loading", async () => {
    let unarchivePatientState: UnarchivePatientState = {
      pageUrl: "/admin/unarchive-patient",
      entriesPerPage: 20,
      orgId: mockOrg1.internalId,
      facilityId: mockFacility1.id,
      patientsCount: 2,
      patients: [mockPatient1],
      facilities: [mockFacility1, mockFacility2],
    };
    render(
      <MemoryRouter>
        <UnarchivePatientInformation
          unarchivePatientState={unarchivePatientState}
          currentPage={1}
          loading={true}
          handlePaginationClick={handlePaginationClick}
        />
      </MemoryRouter>
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(
      screen.queryByText(`Archived patients for ${mockFacility1.name}`)
    ).not.toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("displays archived patients with pagination", async () => {
    let unarchivePatientState: UnarchivePatientState = {
      pageUrl: "/admin/unarchive-patient",
      entriesPerPage: 2,
      orgId: mockOrg1.internalId,
      facilityId: mockFacility1.id,
      patientsCount: 3,
      patients: [mockPatient1, mockPatient2],
      facilities: [mockFacility1, mockFacility2],
    };
    render(
      <MemoryRouter>
        <UnarchivePatientInformation
          unarchivePatientState={unarchivePatientState}
          currentPage={1}
          loading={false}
          handlePaginationClick={handlePaginationClick}
        />
      </MemoryRouter>
    );
    expect(screen.queryByText("Loading")).not.toBeInTheDocument();
    expect(
      screen.getByText(`Archived patients for ${mockFacility1.name}`)
    ).toBeInTheDocument();
    // has pagination
    expect(screen.getByText("1").closest("a")?.getAttribute("href")).toContain(
      "/admin/unarchive-patient/1"
    );
    expect(screen.getByText("2").closest("a")?.getAttribute("href")).toContain(
      "/admin/unarchive-patient/2"
    );
    expect(
      screen.getByText("Next").closest("a")?.getAttribute("href")
    ).toContain("/admin/unarchive-patient/2");
    // check results
    expect(
      screen.getByText("Showing 1-2 of 3", { collapseWhitespace: false })
    ).toBeInTheDocument();
    checkTableHeadersExist();
    checkPatientResultRows();
    // check pagination
    await act(async () => screen.getAllByText("1")[0].closest("a")?.click());
    expect(handlePaginationClick).toHaveBeenCalledWith(1);
    await act(async () => screen.getAllByText("2")[0].closest("a")?.click());
    expect(handlePaginationClick).toHaveBeenNthCalledWith(2, 2);
  });
  it("displays no results", async () => {
    let unarchivePatientState: UnarchivePatientState = {
      pageUrl: "/admin/unarchive-patient",
      entriesPerPage: 20,
      orgId: mockOrg1.internalId,
      facilityId: mockFacility1.id,
      patientsCount: 0,
      patients: [],
      facilities: [mockFacility1, mockFacility2],
    };
    render(
      <MemoryRouter>
        <UnarchivePatientInformation
          unarchivePatientState={unarchivePatientState}
          currentPage={1}
          loading={false}
          handlePaginationClick={handlePaginationClick}
        />
      </MemoryRouter>
    );
    expect(screen.queryByText("Loading")).not.toBeInTheDocument();
    expect(
      screen.getByText(`Archived patients for ${mockFacility1.name}`)
    ).toBeInTheDocument();
    // has no pagination
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    checkTableHeadersExist();
    expect(screen.getByText("No results")).toBeInTheDocument();
  });
});
const checkTableHeadersExist = () => {
  expect(screen.getByText("Patient")).toBeInTheDocument();
  expect(screen.getByText("Date of birth")).toBeInTheDocument();
  expect(screen.getByText("Action")).toBeInTheDocument();
};
