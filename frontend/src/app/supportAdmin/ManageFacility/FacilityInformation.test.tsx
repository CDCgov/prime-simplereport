import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import FacilityInformation from "./FacilityInformation";
import { initialState, ManageFacilityState } from "./ManageFacility";

describe("Facility Information", () => {
  const handleFacilityDelete = jest.fn();
  const mockManageFacilityState: ManageFacilityState = {
    orgId: "123",
    facilityId: "123",
    facility: {
      city: "New York",
      state: "NY",
      zipcode: "12345",
      id: "123",
      name: "The new center",
      org: "Wild trees camp",
      orgType: "school",
      usersCount: 0,
      patientsCount: 0,
    },
  };

  it("renders no selected facility", () => {
    const { container } = render(
      <FacilityInformation
        onFacilityDelete={handleFacilityDelete}
        manageFacilityState={{ ...initialState }}
      />
    );
    expect(screen.getByText(/No facility selected/i)).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it("renders facility information", () => {
    render(
      <FacilityInformation
        onFacilityDelete={handleFacilityDelete}
        manageFacilityState={{ ...mockManageFacilityState }}
      />
    );
    expect(document.body).toMatchSnapshot();
  });

  it("Confirmation modal and go back", async () => {
    render(
      <FacilityInformation
        onFacilityDelete={handleFacilityDelete}
        manageFacilityState={{ ...mockManageFacilityState }}
      />
    );
    const deleteFacilityBtn = screen.getByRole("button", {
      name: /delete facility the new center/i,
    });
    fireEvent.click(deleteFacilityBtn);
    await screen.findByRole("heading", { name: /delete the new center/i });
    expect(document.body).toMatchSnapshot();
    const noGoBackBtn = screen.getByRole("button", { name: /no, go back/i });
    fireEvent.click(noGoBackBtn);
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: /delete the new center/i })
      ).not.toBeInTheDocument()
    );
  });

  it("Confirmation modal and yes delete", async () => {
    render(
      <FacilityInformation
        onFacilityDelete={handleFacilityDelete}
        manageFacilityState={{ ...mockManageFacilityState }}
      />
    );
    const deleteFacilityBtn = screen.getByRole("button", {
      name: /delete facility the new center/i,
    });

    fireEvent.click(deleteFacilityBtn);
    await screen.findByRole("heading", { name: /delete the new center/i });

    const yesDeleteBtn = screen.getByRole("button", {
      name: /yes, delete facility/i,
    });
    fireEvent.click(yesDeleteBtn);
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: /delete the new center/i })
      ).not.toBeInTheDocument()
    );
    expect(handleFacilityDelete).toHaveBeenCalled();
  });
});
