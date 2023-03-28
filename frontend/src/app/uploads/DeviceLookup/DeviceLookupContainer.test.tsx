import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SRToastContainer from "../../commonComponents/SRToastContainer";
import mockSupportedDiseaseTestPerformedCovid from "../../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedCovid";

import DeviceLookupContainer from "./DeviceLookupContainer";

window.scrollTo = jest.fn();
jest.mock("../../../generated/graphql", () => {
  return {
    useGetDeviceTypesForLookupQuery: () => {
      return {
        data: {
          deviceTypes: [
            {
              internalId: "1",
              name: "Abbott Tomorrow",
              loincCode: "loinc-1",
              manufacturer: "Abbott",
              model: "A",
              supportedDiseaseTestPerformed:
                mockSupportedDiseaseTestPerformedCovid,
              swabTypes: [
                {
                  internalId: "1234",
                  name: "NOSE POKE",
                  typeCode: "4321-a",
                },
              ],
            },
          ],
        },
      };
    },
  };
});

describe("DeviceLookupContainer", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <DeviceLookupContainer />
        <SRToastContainer />
      </MemoryRouter>
    );
  });
  afterAll(() => {
    jest.clearAllMocks();
  });

  it("should render device lookup container", async () => {
    expect(screen.getByText("Device code lookup")).toBeInTheDocument();
  });
});
