import renderer, { act } from "react-test-renderer";
import { MockedProvider } from "@apollo/client/testing";

import AoEForm, { LAST_TEST_QUERY } from "./AoEForm";

const mocks = [
  {
    request: {
      query: LAST_TEST_QUERY,
      variables: {
        patientId: "123",
      },
    },
    result: {
      data: {
        patient: {
          lastTest: {
            dateTested: "2021-02-05T22:01:55.386Z",
            result: "NEGATIVE",
          },
        },
      },
    },
  },
];

describe("AoEForm", () => {
  it("snapshot", async () => {
    const component = renderer.create(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AoEForm
          saveButtonText="save"
          onClose={jest.fn()}
          patient={{
            internalId: "123",
            gender: "",
          }}
          saveCallback={jest.fn()}
          isModal={false}
          noValidation={true}
        />
      </MockedProvider>
    );
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(component.toJSON()).toMatchSnapshot();
  });
});
