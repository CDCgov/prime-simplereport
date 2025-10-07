import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AoEForm from "./AoEForm";

describe("AoEForm", () => {
  describe("Test result delivery options", () => {
    describe("SMS", () => {
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
              emails: ["jon@bon.jovi"],
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
          await screen.findByLabelText(
            "Yes, text all mobile numbers on file.",
            {
              exact: false,
            }
          )
        ).toBeInTheDocument();
        expect(
          await screen.findByLabelText(
            "Yes, text all mobile numbers on file.",
            {
              exact: false,
            }
          )
        ).toBeEnabled();
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
              emails: ["jon@bon.jovi"],
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
          name: "Yes, text all mobile numbers on file. (There are no mobile phone numbers listed in your patient profile.)",
        });

        expect(smsDeliveryRadio).toBeInTheDocument();
        expect(smsDeliveryRadio).toBeDisabled();
        expect((await screen.findAllByLabelText("No"))[0]).toBeChecked();
      });
    });

    describe("Email", () => {
      let emails: string[];

      beforeEach(() => {
        emails = [];
      });

      it("displays all patient emails when email delivery is selected", async () => {
        emails.push("foo@bar.com", "bar@foo.com");

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
              email: "foo@bar.com",
              emails: emails,
              birthDate: "1980-01-01",
              telephone: "2708675309",
              phoneNumbers: [
                {
                  type: "LANDLINE",
                  number: "2708675309",
                },
              ],
            }}
            saveCallback={jest.fn()}
            isModal={false}
            noValidation={true}
          />
        );

        const emailPreferenceRadioOption = (
          await screen.findAllByLabelText("Yes", { exact: false })
        )[1];
        expect(emailPreferenceRadioOption).toBeInTheDocument();

        expect(emailPreferenceRadioOption).toBeEnabled();

        for (const email of emails) {
          expect(await screen.findByText(email)).toBeInTheDocument();
        }
      });

      it("disables the email delivery option when patient has no email addresses", async () => {
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
              email: "",
              emails: [],
              birthDate: "1980-01-01",
              telephone: "2708675309",
              phoneNumbers: [
                {
                  type: "LANDLINE",
                  number: "2708675309",
                },
              ],
            }}
            saveCallback={jest.fn()}
            isModal={false}
            noValidation={true}
          />
        );
        const emailDeliveryRadio = screen.getByRole("radio", {
          name: "Yes (There are no email addresses listed in your patient profile.)",
        });

        expect(emailDeliveryRadio).toBeInTheDocument();
        expect(emailDeliveryRadio).toBeDisabled();
        expect((await screen.findAllByLabelText("No"))[1]).toBeChecked();
      });

      it("selects email delivery option when radio button is clicked", async () => {
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
              emails: ["jon@bon.jovi"],
              birthDate: "1980-01-01",
              telephone: "2708675309",
              phoneNumbers: [
                {
                  type: "LANDLINE",
                  number: "2708675309",
                },
              ],
            }}
            saveCallback={jest.fn()}
            isModal={false}
            noValidation={true}
          />
        );

        const emailDeliveryRadio = screen.getByRole("radio", {
          name: "Yes Results will be sent to these email addresses: jon@bon.jovi",
        });

        expect(emailDeliveryRadio).toBeInTheDocument();
        await act(async () => await userEvent.click(emailDeliveryRadio));
        expect(emailDeliveryRadio).toBeChecked();
      });
    });
  });
});
