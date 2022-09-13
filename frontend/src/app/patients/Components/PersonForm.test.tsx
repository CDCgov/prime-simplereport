import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import PersonForm, { PersonFormView } from "./PersonForm";

describe("PersonForm", () => {
  const personFormData: PersonFormData = {
    birthDate: "",
    city: null,
    country: "",
    county: "",
    emails: [],
    employedInHealthcare: undefined,
    ethnicity: "refused",
    facilityId: null,
    firstName: "",
    gender: "refused",
    lastName: "",
    lookupId: "",
    middleName: "",
    phoneNumbers: null,
    preferredLanguage: null,
    race: "refused",
    residentCongregateSetting: undefined,
    role: "",
    state: "",
    street: "",
    streetTwo: null,
    telephone: "",
    testResultDelivery: undefined,
    tribalAffiliation: undefined,
    zipCode: "",
  };
  const savePersonFunction = (
    _savePerson: Nullable<PersonFormData>,
    _startTest?: boolean
  ) => {};
  const getFooter = (
    _onSave: (startTest?: boolean) => void,
    _formChanged: boolean
  ) => <div></div>;
  const mockStore = createMockStore([]);
  const store = {
    facilities: [
      {
        id: "fec4de56-f4cc-4c61-b3d5-76869ca71296",
        name: "Testing Site",
      },
    ],
  };
  describe("date of birth", () => {
    describe("validation", () => {
      beforeEach(() => {
        render(
          <Provider store={mockStore({ ...store })}>
            <MemoryRouter>
              <PersonForm
                patient={personFormData}
                savePerson={savePersonFunction}
                getFooter={getFooter}
              />
            </MemoryRouter>
          </Provider>
        );
      });
      it("should have an error message after invalid date was inserted ", async () => {
        let element = screen.getByTestId("date-picker-external-input");
        userEvent.type(element, "07/04/1776");
        fireEvent.blur(element);
        await waitFor(() => {
          expect(screen.getByText("Error:")).toBeInTheDocument();
        });
      });
      it("should remove the error after a valid date was inserted", async () => {
        let element = screen.getByTestId("date-picker-external-input");
        userEvent.type(element, "07/04/1776");
        fireEvent.blur(element);
        await waitFor(() => {
          expect(screen.getByText("Error:")).toBeInTheDocument();
        });
        userEvent.clear(element);
        userEvent.type(element, "07/04/2022");
        fireEvent.blur(element);

        await waitFor(() => {
          expect(screen.queryByText("Error:")).not.toBeInTheDocument();
        });
      });
      describe("pxpView", () => {
        it("should have not have error message after blur", async () => {
          cleanup();
          render(
            <Provider store={mockStore({ ...store })}>
              <MemoryRouter>
                <PersonForm
                  patient={personFormData}
                  savePerson={savePersonFunction}
                  getFooter={getFooter}
                  view={PersonFormView.PXP}
                />
              </MemoryRouter>
            </Provider>
          );
          let element = screen.getByTestId("date-picker-external-input")
            .parentElement;
          fireEvent.blur(element as HTMLElement);

          await waitFor(() => {
            // queryBy* does not throw an error if not found
            expect(screen.queryByText("Error:")).not.toBeInTheDocument();
          });
        });
      });
    });
  });
});
