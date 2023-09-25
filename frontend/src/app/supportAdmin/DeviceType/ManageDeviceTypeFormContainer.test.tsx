import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import selectEvent from "react-select-event";

import { DeviceType, SpecimenType } from "../../../generated/graphql";
import SRToastContainer from "../../commonComponents/SRToastContainer";
import { editDevicePageTitle } from "../pageTitles";

import ManageDeviceTypeFormContainer from "./ManageDeviceTypeFormContainer";
import mockSupportedDiseaseTestPerformedCovid from "./mocks/mockSupportedDiseaseTestPerformedCovid";

const mockUpdateDeviceType = jest.fn();

const addValue = async (user: UserEvent, name: string, value: string) => {
  await user.type(screen.getByLabelText(name, { exact: false }), value);
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
            {
              internalId: "123-456",
              name: "Flu A",
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
              swabTypes: [
                { internalId: "123", name: "nose", typeCode: "n123" },
              ],
              supportedDiseaseTestPerformed:
                mockSupportedDiseaseTestPerformedCovid,
              testLength: 15,
            },
            {
              internalId: "abc2",
              name: "Fission Energizer",
              model: "Model B",
              manufacturer: "Curentz",
              loincCode: "1234-2",
              swabTypes: [{ internalId: "456", name: "eye", typeCode: "e456" }],
              supportedDiseaseTestPerformed:
                mockSupportedDiseaseTestPerformedCovid,
              testLength: 15,
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
              supportedDiseaseTestPerformed:
                mockSupportedDiseaseTestPerformedCovid,
              testLength: 15,
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

describe("ManageDeviceTypeFormContainer", () => {
  const renderWithUser = () => ({
    user: userEvent.setup(),
    ...render(
      <>
        <ManageDeviceTypeFormContainer />
        <SRToastContainer />
      </>
    ),
  });

  it("renders the Manage Device Type Form Container item", () => {
    const { container } = renderWithUser();
    expect(container).toMatchSnapshot();
  });

  it("should show the device type form", async () => {
    renderWithUser();
    expect(await screen.findByText(editDevicePageTitle)).toBeInTheDocument();
  });

  it("should update the selected device", async () => {
    const { user } = renderWithUser();

    await selectEvent.select(
      screen.getByLabelText(/select device/i),
      "Covalent Observer"
    );

    await addValue(user, "Manufacturer", " LLC");
    await addValue(user, "Model", "D");

    await user.selectOptions(
      screen.getByLabelText("Supported disease *"),
      "COVID-19"
    );

    await user.clear(screen.getByLabelText("Test performed code *"));

    await user.type(screen.getByLabelText("Test performed code *"), "LP 123");

    await user.clear(screen.getByLabelText("Test ordered code *"));

    await user.type(screen.getByLabelText("Test ordered code *"), "LP 321");

    expect(screen.getByText("Save changes")).toBeEnabled();

    await user.click(screen.getByText("Save changes"));

    await waitFor(() =>
      expect(mockUpdateDeviceType).toHaveBeenCalledWith({
        fetchPolicy: "no-cache",
        variables: {
          internalId: "abc3",
          name: "Covalent Observer",
          manufacturer: "Vitamin Tox LLC",
          model: "Model CD",
          swabTypes: ["789"],
          testLength: 15,
          supportedDiseaseTestPerformed: [
            {
              supportedDisease: "294729",
              testPerformedLoincCode: "LP 123",
              testOrderedLoincCode: "LP 321",
              testkitNameId: "testkitNameId123",
              equipmentUid: "equipmentUid123",
            },
          ],
        },
      })
    );

    expect(mockUpdateDeviceType).toBeCalledTimes(1);

    expect(
      await screen.findByText("Redirected to /admin?facility=12345")
    ).toBeInTheDocument();
  });
});
