import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SpecimenType } from "../../../generated/graphql";

import DeviceTypeFormContainer from "./DeviceTypeFormContainer";
import { addValue } from "./DeviceTypeForm.test";

const mockCreateDeviceType = jest.fn();

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
  };
});

jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    Navigate: (props: any) => `Redirected to ${props.to}`,
  };
});

describe("DeviceTypeFormContainer", () => {
  it("should show the device type form", async () => {
    render(<DeviceTypeFormContainer />);

    expect(await screen.findByText("Device type")).toBeInTheDocument();
  });

  it("should save the new device", async () => {
    render(<DeviceTypeFormContainer />);

    addValue("Device name", "Accula");
    addValue("Manufacturer", "Mesa Biotech");
    addValue("Model", "Accula SARS-Cov-2 Test*");
    addValue("LOINC code", "95409-9");

    userEvent.click(screen.getByTestId("multi-select-input"));

    userEvent.click(screen.getByText("Cotton (5309)"));

    userEvent.click(screen.getByText("Save changes"));

    await screen.findByText("Redirected to /admin");

    expect(mockCreateDeviceType).toBeCalledTimes(1);
    expect(mockCreateDeviceType).toHaveBeenCalledWith({
      fetchPolicy: "no-cache",
      variables: {
        loincCode: "95409-9",
        manufacturer: "Mesa Biotech",
        model: "Accula SARS-Cov-2 Test*",
        name: "Accula",
        swabTypes: ["887799"],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await screen.findByText("Redirected to /admin");
  });
});
