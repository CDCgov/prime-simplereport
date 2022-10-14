import { render } from "@testing-library/react";
import { ToastContainer } from "react-toastify";

import { SpecimenType } from "../../../generated/graphql";

import DeviceLookupContainer from "./DeviceLookupContainer";

jest.mock("../../../generated/graphql", () => {
  return {
    useGetSpecimenTypesQuery: () => {
      return {
        data: {
          specimenTypes: [
            {
              internalId: "1234",
              name: "NOSE POKE",
              typeCode: "4321-a",
            },
          ] as SpecimenType[],
        },
      };
    },
    useGetDeviceTypeListQuery: () => {
      return {
        data: {
          deviceTypes: [
            {
              internalId: "1",
              name: "Abbott Tomorrow",
              loincCode: "loinc-1",
              manufacturer: "Abbott",
              model: "A",
              swabTypes: ["1234"],
            },
          ],
        },
      };
    },
  };
});

let container: any;

describe("DeviceLookupContainer", () => {
  beforeEach(() => {
    container = render(
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
    expect(container).toMatchSnapshot();
  });
});
