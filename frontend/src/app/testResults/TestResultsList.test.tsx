import { render } from "@testing-library/react";
import { DetachedTestResultsList } from "./TestResultsList";

// Data copied from Chrome network window
const testResults = [
  {
    internalId: "3c7998ca-b072-4201-877d-9a1523b0f10c",
    dateTested: "2021-01-04T00:00:00Z",
    result: "UNDETERMINED",
    deviceType: {
      internalId: "f5bd2103-ce04-4290-94a4-ffeea170b0f9",
      name: "LumiraDX",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "633ad102-30f9-4465-b035-bc0c39123fb4",
      firstName: "Cheez",
      middleName: "",
      lastName: "Whizzz",
      lookupId: null,
      __typename: "Patient",
    },
    __typename: "TestResult",
  },
  {
    internalId: "a65bce75-4771-4611-a3b1-9fd6e3d34a1d",
    dateTested: "2021-01-12T17:56:07.403Z",
    result: "NEGATIVE",
    deviceType: {
      internalId: "f5bd2103-ce04-4290-94a4-ffeea170b0f9",
      name: "LumiraDX",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "1eb99bc3-52b1-4bd7-9268-4cfea80a3f8d",
      firstName: "Davis",
      middleName: "",
      lastName: "Melvin",
      lookupId: null,
      __typename: "Patient",
    },
    __typename: "TestResult",
  },
];

describe("TestResultsList", () => {
  it("should render a list of tests", async () => {
    const { container, getByText } = render(
      <DetachedTestResultsList
        activeFacilityId={"fake-facility-1234"}
        data={{ testResults }}
      />
    );
    expect(getByText("Test Results")).toBeInTheDocument();
    expect(getByText("Cheez Whizzz")).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
