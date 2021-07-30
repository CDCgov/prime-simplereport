import renderer from "react-test-renderer";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import React from "react";

import AoEModalForm, { LAST_TEST_QUERY } from "./AoEModalForm";
import AoEForm from "./AoEForm";

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
            dateTested: null,
            result: null,
          },
        },
      },
    },
  },
];

describe("AoEForm", () => {
  it("displays unknown prior test date and result", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <AoEModalForm
          saveButtonText="save"
          onClose={jest.fn()}
          patient={{
            internalId: "123",
            gender: "male",
            firstName: "Steve",
            lastName: "Jobs",
          }}
          loadState={{
            noSymptoms: false,
            symptoms: '{"426000000":"true","49727002":false}',
            symptomOnset: "",
            priorTestDate: null,
            priorTestResult: null,
            priorTestType: null,
            firstTest: false,
            pregnancy: false,
          }}
          saveCallback={jest.fn()}
        />
      </MockedProvider>
    );
    const verbally = await screen.findByLabelText("verbally", {
      exact: false,
    });
    expect(verbally).toBeChecked();
    const recentTestDate = await screen.findByLabelText(
      "Date of most recent test"
    );
    expect(recentTestDate).toBeDisabled();
    const checkbox = await screen.findByLabelText("Unknown");
    expect(checkbox).toBeChecked();
    const result = await screen.findByLabelText("Result of", {
      exact: false,
    });
    expect(result).toHaveValue("UNKNOWN");
  });

  it("renders correctly", () => {
    let component: renderer.ReactTestRenderer;

    component = renderer.create(
      <MockedProvider mocks={mocks}>
        <AoEForm
          saveButtonText="save"
          onClose={jest.fn()}
          patient={{
            firstName: "Jon",
            middleName: "Bon",
            lastName: "Jovi",
            internalId: "123",
            gender: "male",
            testResultDelivery: "SMS",
            birthDate: "1980-01-01",
            telephone: "2708675309",
            phoneNumbers: [
              {
                number: "2708675309",
                type: "MOBILE",
              },
            ],
          }}
          loadState={{
            noSymptoms: false,
            symptoms: '{"426000000":"true","49727002":false}',
            symptomOnset: "2021-06-20",
            priorTestDate: "2021-06-21",
            priorTestResult: "NEGATIVE",
            priorTestType: "fake-test-type",
            firstTest: false,
            pregnancy: "77386006",
          }}
          saveCallback={jest.fn()}
          isModal={false}
          noValidation={true}
          lastTest={{
            dateTested: "2021-06-21T14:48:00",
            result: "NEGATIVE",
          }}
        />
      </MockedProvider>
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  describe("Test result delivery options", () => {
    let phoneNumbers: PhoneNumber[];

    beforeEach(() => {
      phoneNumbers = [];
    });

    it("displays all of a patient's mobile numbers when SMS delivery is selected", async () => {
      phoneNumbers.push(
        {
          number: "6318675309",
          type: "MOBILE",
        },
        {
          number: "2708675309",
          type: "MOBILE",
        }
      );

      render(
        <MockedProvider mocks={mocks}>
          <AoEForm
            saveButtonText="save"
            onClose={jest.fn()}
            patient={{
              firstName: "Jon",
              middleName: "Bon",
              lastName: "Jovi",
              internalId: "123",
              gender: "male",
              testResultDelivery: "SMS",
              birthDate: "1980-01-01",
              telephone: "2708675309",
              phoneNumbers: phoneNumbers,
            }}
            saveCallback={jest.fn()}
            isModal={false}
            noValidation={true}
            lastTest={{
              dateTested: "2021-06-21T14:48:00",
              result: "NEGATIVE",
            }}
          />
        </MockedProvider>
      );

      expect((await screen.findAllByLabelText("Yes"))[0]).toBeInTheDocument();
      expect((await screen.findAllByLabelText("Yes"))[0]).not.toBeDisabled();
      phoneNumbers.forEach(async ({ number }) => {
        expect(await screen.findByText(number)).toBeInTheDocument();
      });
    });

    it("disables the SMS delivery option when patient has no mobile phone numbers", async () => {
      phoneNumbers.push({
        number: "6318675309",
        type: "LANDLINE",
      });

      render(
        <MockedProvider mocks={mocks}>
          <AoEForm
            saveButtonText="save"
            onClose={jest.fn()}
            patient={{
              firstName: "Jon",
              middleName: "Bon",
              lastName: "Jovi",
              internalId: "123",
              gender: "male",
              testResultDelivery: "SMS",
              birthDate: "1980-01-01",
              telephone: "2708675309",
              phoneNumbers: phoneNumbers,
            }}
            saveCallback={jest.fn()}
            isModal={false}
            noValidation={true}
            lastTest={{
              dateTested: "2021-06-21T14:48:00",
              result: "NEGATIVE",
            }}
          />
        </MockedProvider>
      );
      const smsDeliveryRadio = screen.getByRole("radio", {
        name:
          "Yes (There are no mobile phone numbers listed in your patient profile.)",
      });

      expect(smsDeliveryRadio).toBeInTheDocument();
      expect(smsDeliveryRadio).toBeDisabled();
      expect((await screen.findAllByLabelText("No"))[0]).toBeChecked();
    });
  });
});
