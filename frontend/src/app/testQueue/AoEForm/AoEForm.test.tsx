import { render, screen } from "@testing-library/react";

import AoEForm from "./AoEForm";

describe("AoEForm", () => {
  it("renders correctly", () => {
    const component = render(
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
          email: "jon@bon.jovi",
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
          pregnancy: "77386006",
        }}
        saveCallback={jest.fn()}
        isModal={false}
        noValidation={true}
      />
    );

    expect(component.container.firstChild).toMatchSnapshot();
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
            email: "jon@bon.jovi",
            birthDate: "1980-01-01",
            telephone: "2708675309",
            phoneNumbers: phoneNumbers,
          }}
          saveCallback={jest.fn()}
          isModal={false}
          noValidation={true}
        />
      );

      expect(
        await screen.findByLabelText("Yes, text all mobile numbers on file.", {
          exact: false,
        })
      ).toBeInTheDocument();
      expect(
        await screen.findByLabelText("Yes, text all mobile numbers on file.", {
          exact: false,
        })
      ).not.toBeDisabled();
      for (const { number } of phoneNumbers) {
        expect(await screen.findByText(number)).toBeInTheDocument();
      }
    });

    it("disables the SMS delivery option when patient has no mobile phone numbers", async () => {
      phoneNumbers.push({
        number: "6318675309",
        type: "LANDLINE",
      });

      render(
        <AoEForm
          saveButtonText="save"
          onClose={jest.fn()}
          patient={{
            firstName: "Jon",
            middleName: "Bon",
            lastName: "Jovi",
            internalId: "123",
            gender: "male",
            testResultDelivery: "NONE",
            email: "jon@bon.jovi",
            birthDate: "1980-01-01",
            telephone: "2708675309",
            phoneNumbers: phoneNumbers,
          }}
          saveCallback={jest.fn()}
          isModal={false}
          noValidation={true}
        />
      );
      const smsDeliveryRadio = screen.getByRole("radio", {
        name:
          "Yes, text all mobile numbers on file. (There are no mobile phone numbers listed in your patient profile.)",
      });

      expect(smsDeliveryRadio).toBeInTheDocument();
      expect(smsDeliveryRadio).toBeDisabled();
      expect((await screen.findAllByLabelText("No"))[0]).toBeChecked();
    });
  });
});
