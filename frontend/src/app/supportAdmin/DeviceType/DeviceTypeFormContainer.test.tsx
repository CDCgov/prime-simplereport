import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SpecimenType } from "../../../generated/graphql";
import SRToastContainer from "../../commonComponents/SRToastContainer";

import DeviceTypeFormContainer from "./DeviceTypeFormContainer";

const mockCreateDeviceType = jest.fn();

const addValue = (name: string, value: string) => {
  userEvent.type(screen.getByLabelText(name, { exact: false }), value);
};

jest.mock("../../../generated/graphql", () => {
  return {
    useCreateDeviceTypeMutation: () => [
      (options: any) => {
        mockCreateDeviceType(options);
        return Promise.resolve();
      },
    ],
    useGetSpecimenTypesQuery: () => {
      return {
        data: {
          specimenTypes: [
            {
              internalId: "887799",
              name: "Cotton",
              typeCode: "5309",
            },
          ] as SpecimenType[],
        },
      };
    },
    useGetSupportedDiseasesQuery: () => {
      return {
        data: {
          supportedDiseases: [
            {
              internalId: "294729",
              name: "COVID-19",
              loinc: "4829",
            },
          ],
        },
      };
    },
  };
});

jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    Navigate: (props: any) => `Redirected to ${props.to}`,
  };
});

const mockFacility: any = {
  id: "12345",
};

jest.mock("../../facilitySelect/useSelectedFacility", () => {
  return {
    useSelectedFacility: () => {
      return [mockFacility, () => {}];
    },
  };
});

let container: any;

describe("DeviceTypeFormContainer", () => {
  beforeEach(() => {
    container = render(
      <>
        <DeviceTypeFormContainer />
        <SRToastContainer />
      </>
    );
  });
  it("should render the device type form", async () => {
    expect(container).toMatchSnapshot();
  });

  it("should save the new device", async () => {
    addValue("Device name", "Accula");
    addValue("Manufacturer", "Mesa Biotech");
    addValue("Model", "Accula SARS-Cov-2 Test*");
    addValue("LOINC code", "95409-9");

    userEvent.click(screen.getAllByTestId("multi-select-input")[0]);

    userEvent.click(screen.getByText("Cotton (5309)"));

    userEvent.click(screen.getAllByTestId("multi-select-input")[1]);

    userEvent.click(screen.getByText("COVID-19"));

    userEvent.click(screen.getByText("Save changes"));

    await screen.findByText("Redirected to /admin?facility=12345");

    expect(mockCreateDeviceType).toBeCalledTimes(1);
    expect(mockCreateDeviceType).toHaveBeenCalledWith({
      fetchPolicy: "no-cache",
      variables: {
        loincCode: "95409-9",
        manufacturer: "Mesa Biotech",
        model: "Accula SARS-Cov-2 Test*",
        name: "Accula",
        swabTypes: ["887799"],
        supportedDiseases: ["294729"],
        testLength: 15,
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await screen.findByText("Redirected to /admin?facility=12345");
  });
  it("should display error on invalid test length", async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));

    addValue("Manufacturer", " LLC");
    addValue("Model", "D");
    userEvent.clear(screen.getByLabelText("Test length", { exact: false }));

    userEvent.click(screen.getByText("Save changes"));

    expect(mockCreateDeviceType).not.toHaveBeenCalled();
    expect(
      await screen.findByText("Failed to create device. Invalid test length")
    ).toBeInTheDocument();
  });
});
