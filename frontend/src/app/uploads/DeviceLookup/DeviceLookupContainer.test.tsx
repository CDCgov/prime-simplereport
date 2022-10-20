import { render, screen } from "@testing-library/react";

import SRToastContainer from "../../commonComponents/SRToastContainer";

import DeviceLookupContainer from "./DeviceLookupContainer";

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
      <>
        <DeviceLookupContainer />
        <SRToastContainer />
      </>
    );
  });

  it("should render device lookup container", async () => {
    expect(screen.getByText("Device lookup")).toBeInTheDocument();
  });
});
