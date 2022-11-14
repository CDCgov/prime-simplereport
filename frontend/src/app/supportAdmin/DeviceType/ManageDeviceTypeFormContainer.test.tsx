import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DeviceType, SpecimenType } from "../../../generated/graphql";
import SRToastContainer from "../../commonComponents/SRToastContainer";

import ManageDeviceTypeFormContainer from "./ManageDeviceTypeFormContainer";

const mockUpdateDeviceType = jest.fn();

const addValue = (name: string, value: string) => {
  userEvent.type(screen.getByLabelText(name, { exact: false }), value);
};

jest.mock("../../../generated/graphql", () => {
  return {
    useUpdateDeviceTypeMutation: () => [
      (options: any) => {
        mockUpdateDeviceType(options);
        return Promise.resolve();
      },
    ],
    useGetSpecimenTypesQuery: () => {
      return {
        data: {
          specimenTypes: [
            {
              internalId: "123",
              name: "nose",
              typeCode: "123",
            },
            {
              internalId: "456",
              name: "eyes",
              typeCode: "456",
            },
            {
              internalId: "789",
              name: "mouth",
              typeCode: "789",
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
    useGetDeviceTypeListQuery: () => {
      return {
        data: {
          deviceTypes: [
            {
              internalId: "abc1",
              name: "Tesla Emitter",
              model: "Model A",
              manufacturer: "Celoxitin",
              loincCode: "1234-1",
              swabTypes: [
                { internalId: "123", name: "nose", typeCode: "n123" },
              ],
              supportedDiseases: [
                { internalId: "294729", name: "COVID-19", loinc: "4829" },
              ],
            },
            {
              internalId: "abc2",
              name: "Fission Energizer",
              model: "Model B",
              manufacturer: "Curentz",
              loincCode: "1234-2",
              swabTypes: [{ internalId: "456", name: "eye", typeCode: "e456" }],
              supportedDiseases: [
                { internalId: "294729", name: "COVID-19", loinc: "4829" },
              ],
            },
            {
              internalId: "abc3",
              name: "Covalent Observer",
              model: "Model C",
              manufacturer: "Vitamin Tox",
              loincCode: "1234-3",
              swabTypes: [
                { internalId: "789", name: "mouth", typeCode: "m789" },
              ],
              supportedDiseases: [
                { internalId: "294729", name: "COVID-19", loinc: "4829" },
              ],
            },
          ] as DeviceType[],
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

describe("ManageDeviceTypeFormContainer", () => {
  beforeEach(() => {
    container = render(
      <>
        <ManageDeviceTypeFormContainer />
        <SRToastContainer />
      </>
    );
  });

  it("renders the Manage Device Type Form Container item", () => {
    expect(container).toMatchSnapshot();
  });

  it("should show the device type form", async () => {
    expect(await screen.findByText("Manage devices")).toBeInTheDocument();
  });

  it("should update the selected device", async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));

    userEvent.click(screen.getByTestId("combo-box-select"));
    userEvent.click(screen.getAllByText("Covalent Observer")[1]);

    await new Promise((resolve) => setTimeout(resolve, 0));

    addValue("Manufacturer", " LLC");

    addValue("Model", "D");

    userEvent.click(screen.getByText("Save changes"));

    expect(mockUpdateDeviceType).toBeCalledTimes(1);
    expect(mockUpdateDeviceType).toHaveBeenCalledWith({
      fetchPolicy: "no-cache",
      variables: {
        internalId: "abc3",
        name: "Covalent Observer",
        loincCode: "1234-3",
        manufacturer: "Vitamin Tox LLC",
        model: "Model CD",
        swabTypes: ["789"],
        supportedDiseases: ["294729"],
        testLength: 15,
      },
    });

    expect(
      await screen.findByText("Redirected to /admin?facility=12345")
    ).toBeInTheDocument();
  });

  it("should display error when update fails", async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));

    userEvent.click(screen.getByTestId("combo-box-select"));
    userEvent.click(screen.getAllByText("Covalent Observer")[1]);

    await new Promise((resolve) => setTimeout(resolve, 0));

    addValue("Manufacturer", " LLC");
    addValue("Model", "D");
    addValue("Test length", "invalid value");

    userEvent.click(screen.getByText("Save changes"));

    expect(mockUpdateDeviceType).toBeCalledTimes(0);
    expect(
      await screen.findByText("Failed to update device. Invalid test length")
    ).toBeInTheDocument();
  });
});
