import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SpecimenType, DeviceType } from "../../../generated/graphql";

import ManageDeviceTypeFormContainer from "./ManageDeviceTypeFormContainer";
import { addValue } from "./DeviceTypeForm.test";

const mockUpdateDeviceType = jest.fn();

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
            },
            {
              internalId: "abc2",
              name: "Fission Energizer",
              model: "Model B",
              manufacturer: "Curentz",
              loincCode: "1234-2",
              swabTypes: [{ internalId: "456", name: "eye", typeCode: "e456" }],
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

describe("ManageDeviceTypeFormContainer", () => {
  beforeEach(() => {
    render(<ManageDeviceTypeFormContainer />);
  });

  it("should show the device type form", async () => {
    expect(await screen.findByText("Manage devices")).toBeInTheDocument();
  });

  it("should update the selected device", async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));

    userEvent.selectOptions(
      screen.getByLabelText("Device name", { exact: false }),
      "Covalent Observer"
    );

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
      },
    });

    expect(await screen.findByText("Redirected to /admin")).toBeInTheDocument();
  });
});
