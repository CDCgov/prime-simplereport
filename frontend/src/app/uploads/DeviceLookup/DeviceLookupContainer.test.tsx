import { render, screen } from "@testing-library/react";
import { ToastContainer } from "react-toastify";

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
        <ToastContainer
          autoClose={5000}
          closeButton={false}
          limit={2}
          position={"bottom-center"}
          hideProgressBar={true}
        />
      </>
    );
  });

  it("should render device lookup container", async () => {
    expect(screen.getByText("Device lookup")).toBeInTheDocument();
  });
});
