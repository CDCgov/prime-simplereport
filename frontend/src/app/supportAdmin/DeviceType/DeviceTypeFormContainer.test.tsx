import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SpecimenType } from "../../../generated/graphql";
import SRToastContainer from "../../commonComponents/SRToastContainer";

import DeviceTypeFormContainer from "./DeviceTypeFormContainer";

const mockCreateDeviceType = jest.fn();

const addValue = async (name: string, value: string) => {
  await act(
    async () =>
      await userEvent.type(screen.getByLabelText(name, { exact: false }), value)
  );
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
    await addValue("Device name", "Accula");
    await addValue("Manufacturer", "Mesa Biotech");
    await addValue("Model", "Accula SARS-Cov-2 Test*");
    await addValue("Test length (minutes) ", "15");

    await act(
      async () =>
        await userEvent.click(screen.getAllByTestId("multi-select-input")[0])
    );
    await act(
      async () => await userEvent.click(screen.getByText("Cotton (5309)"))
    );

    await act(
      async () =>
        await userEvent.click(screen.getAllByTestId("multi-select-input")[1])
    );
    await act(
      async () => await userEvent.click(screen.getAllByText("COVID-19")[0])
    );

    await act(
      async () =>
        await userEvent.selectOptions(
          screen.getByLabelText("Supported disease *"),
          "COVID-19"
        )
    );
    await act(
      async () =>
        await userEvent.type(
          screen.getByLabelText("Test performed code *"),
          "1920-12"
        )
    );
    await act(
      async () =>
        await userEvent.type(
          screen.getByLabelText("Test ordered code *"),
          "2102-91"
        )
    );
    await act(
      async () => await userEvent.click(screen.getByText("Save changes"))
    );

    await waitFor(() =>
      expect(mockCreateDeviceType).toHaveBeenCalledWith({
        fetchPolicy: "no-cache",
        variables: {
          internalId: undefined,
          manufacturer: "Mesa Biotech",
          model: "Accula SARS-Cov-2 Test*",
          name: "Accula",
          swabTypes: ["887799"],
          testLength: 15,
          supportedDiseaseTestPerformed: [
            {
              supportedDisease: "294729",
              testPerformedLoincCode: "1920-12",
              testOrderedLoincCode: "2102-91",
            },
          ],
        },
      })
    );
    expect(mockCreateDeviceType).toBeCalledTimes(1);

    await screen.findByText("Redirected to /admin?facility=12345");
  });
});
