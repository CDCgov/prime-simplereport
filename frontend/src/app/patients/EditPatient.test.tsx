import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import MockDate from "mockdate";
import * as router from "react-router";
import React from "react";

import SRToastContainer from "../commonComponents/SRToastContainer";
import { PATIENT_TERM_CAP } from "../../config/constants";
import { createGQLWrappedMemoryRouterWithDataApis } from "../utils/reactRouter";

import EditPatient, { GET_PATIENT, UPDATE_PATIENT } from "./EditPatient";
import EditPatientContainer from "./EditPatientContainer";

const mockStore = configureStore([]);

const mockFacilityID = "b0d2041f-93c9-4192-b19a-dd99c0044a7e";
const mockPatientID = "555e8a40-0f95-458e-a038-6b500a0fc2ad";
const store = mockStore({
  facilities: [{ id: mockFacilityID, name: "123" }],
});

describe("EditPatient", () => {
  describe("Waiting for network response", () => {
    it("shows loading text", async () => {
      render(
        <MemoryRouter>
          <Provider store={store}>
            <MockedProvider mocks={mocks} addTypename={false}>
              <EditPatient
                facilityId={mockFacilityID}
                patientId={mockPatientID}
              />
            </MockedProvider>
          </Provider>
        </MemoryRouter>
      );
      expect(
        screen.getAllByText("loading...", { exact: false })[0]
      ).toBeInTheDocument();
    });
  });

  describe("post-submit actions", () => {
    const mocks = [
      {
        request: {
          query: GET_PATIENT,
          variables: {
            id: mockPatientID,
          },
        },
        result: {
          data: {
            patient: {
              firstName: "Eugenia",
              middleName: null,
              lastName: "Franecki",
              birthDate: "1939-10-11",
              street: "736 Jackson PI NW",
              streetTwo: "DC",
              city: "Washington",
              state: "DC",
              country: "USA",
              zipCode: "12345",
              telephone: "(270) 867-5309",
              phoneNumbers: [
                {
                  type: "LANDLINE",
                  number: "(631) 867-5309",
                },
                {
                  type: "MOBILE",
                  number: "(270) 867-5309",
                },
              ],
              role: "UNKNOWN",
              emails: ["foo@bar.com"],
              county: null,
              race: "white",
              ethnicity: "hispanic",
              gender: "male",
              genderIdentity: "male",
              residentCongregateSetting: true,
              employedInHealthcare: true,
              facility: null,
              testResultDelivery: null,
              tribalAffiliation: [null],
              notes: null,
            },
          },
        },
      },
      {
        request: {
          query: UPDATE_PATIENT,
          variables: {
            patientId: "555e8a40-0f95-458e-a038-6b500a0fc2ad",
            firstName: "Fake Name",
            middleName: null,
            lastName: "Franecki",
            birthDate: "1939-10-11",
            street: "736 Jackson PI NW",
            streetTwo: "DC",
            city: "Washington",
            state: "DC",
            country: "USA",
            zipCode: "12345",
            telephone: "(270) 867-5309",
            phoneNumbers: [
              { number: "(270) 867-5309", type: "MOBILE" },
              { number: "(631) 867-5309", type: "LANDLINE" },
            ],
            role: "UNKNOWN",
            emails: ["foo@bar.com"],
            county: null,
            race: "white",
            ethnicity: "hispanic",
            gender: "male",
            genderIdentity: "male",
            residentCongregateSetting: true,
            employedInHealthcare: true,
            facility: null,
            testResultDelivery: null,
            tribalAffiliation: undefined,
            preferredLanguage: null,
            facilityId: null,
            unknownPhoneNumber: false,
            unknownAddress: false,
            notes: "Red tent",
          },
        },
        result: {
          data: {
            updatePatient: {
              internalId: "153f661f-b6ea-4711-b9ab-487b95198cce",
              facility: {
                id: "facility-id-001",
              },
            },
          },
        },
      },
    ];

    function renderWithRoutes(
      facilityId: string,
      patientId: string,
      fromQueue: boolean
    ) {
      const elementToTest = (
        <EditPatient
          facilityId={facilityId}
          patientId={patientId}
          fromQueue={fromQueue}
        />
      );
      const elementToRender = createGQLWrappedMemoryRouterWithDataApis(
        elementToTest,
        store,
        mocks,
        false,
        "/patient/",
        [`/patient?facility=${mockFacilityID}`]
      );
      return {
        user: userEvent.setup(),
        ...render(elementToRender),
      };
    }

    const mockNavigate = jest.fn();

    beforeEach(() => {
      jest.spyOn(router, "useNavigate").mockImplementation(() => mockNavigate);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("can redirect to the new test form upon save", async () => {
      const { user } = renderWithRoutes(mockFacilityID, mockPatientID, false);
      await screen.findByText(/Loading/i);
      await waitFor(() =>
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument()
      );

      // Make an arbitrary change on the form to allow submission
      const name = await screen.findByLabelText("First name", { exact: false });
      // Error message on bad value
      await user.clear(name);
      await user.type(name, "Fake Name");
      await user.tab();

      const notes = await screen.findByLabelText("Notes", { exact: false });
      await user.type(notes, "Red tent");

      const saveAndStartButton = screen.getByText("Save and start test", {
        exact: false,
      });

      expect(saveAndStartButton).toBeEnabled();

      await user.click(saveAndStartButton);

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith(
          "/queue?facility=b0d2041f-93c9-4192-b19a-dd99c0044a7e",
          {
            state: {
              patientId: "555e8a40-0f95-458e-a038-6b500a0fc2ad",
            },
          }
        )
      );
    });

    it("redirects to test queue on save when coming from Conduct tests page", async () => {
      const { user } = renderWithRoutes(mockFacilityID, mockPatientID, true);
      await screen.findByText(/Loading/i);
      await waitFor(() =>
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument()
      );

      // Make an arbitrary change on the form to allow submission
      const name = await screen.findByLabelText("First name", { exact: false });

      await user.clear(name);
      await user.type(name, "Fake Name");
      await user.tab();

      const notes = await screen.findByLabelText("Notes", { exact: false });
      await user.type(notes, "Red tent");

      const saveButton = screen.getAllByText("Save changes", {
        exact: false,
      })[0];

      expect(saveButton).toBeEnabled();

      await user.click(saveButton);

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith(
          "/queue?facility=b0d2041f-93c9-4192-b19a-dd99c0044a7e",
          {
            state: {
              patientId: "555e8a40-0f95-458e-a038-6b500a0fc2ad",
            },
          }
        )
      );
    });
  });

  describe("phone number input", () => {
    const mocks = [
      {
        request: {
          query: GET_PATIENT,
          variables: {
            id: mockPatientID,
          },
        },
        result: {
          data: {
            patient: {
              firstName: "Eugenia",
              middleName: null,
              lastName: "Franecki",
              birthDate: "1939-10-11",
              street: "736 Jackson PI NW",
              streetTwo: "DC",
              city: null,
              state: "DC",
              zipCode: null,
              telephone: "(270) 867-5309",
              phoneNumbers: [
                {
                  type: "LANDLINE",
                  number: "(631) 867-5309",
                },
                {
                  type: "MOBILE",
                  number: "(270) 867-5309",
                },
              ],
              role: "UNKNOWN",
              emails: ["foo@bar.com"],
              county: null,
              race: null,
              ethnicity: null,
              gender: null,
              genderIdentity: null,
              residentCongregateSetting: true,
              employedInHealthcare: true,
              facility: null,
              testResultDelivery: null,
              tribalAffiliation: [null],
            },
          },
        },
      },
    ];
    const elementToTest = (
      <EditPatient facilityId={mockFacilityID} patientId={mockPatientID} />
    );

    const elementToRender = createGQLWrappedMemoryRouterWithDataApis(
      elementToTest,
      store,
      mocks,
      false
    );

    const renderWithUser = () => ({
      user: userEvent.setup(),
      ...render(
        <>
          {elementToRender}
          <SRToastContainer />
        </>
      ),
    });

    const waitForDataLoad = async () => {
      expect(
        (await screen.findAllByText("Franecki, Eugenia", { exact: false }))[0]
      ).toBeInTheDocument();
    };

    it("populates primary phone number field with patient `telephone`", async () => {
      renderWithUser();
      await waitForDataLoad();
      const legend = "Primary phone number";
      const input = screen.getByLabelText(legend, {
        exact: false,
      }) as HTMLInputElement;

      if (input === null) {
        throw Error(`Unable to corresponding input for ${legend}`);
      }

      // In the GraphQL response, this was the second entry in the
      // phone numbers array, but the array should be sorted to place the
      // value matching `patient.telephone` first
      expect(input.value).toBe("(270) 867-5309");
    });

    it("displays a validation failure alert if phone type not entered", async () => {
      const { user } = renderWithUser();
      await waitForDataLoad();
      await user.click(
        screen.queryAllByText("Add another number", {
          exact: false,
        })[0]
      );
      // Do not enter phone type for additional number

      await user.type(await screen.findByTestId("phoneInput-2"), "6378908987");
      await user.click((await screen.findAllByText("Save changes"))[0]);
      await waitFor(() =>
        expect(screen.queryAllByText(/Phone type is required/i)).toHaveLength(2)
      );
    });
  });

  describe("facility select input", () => {
    const mocks = [
      {
        request: {
          query: GET_PATIENT,
          variables: {
            id: mockPatientID,
          },
        },
        result: {
          data: {
            patient: {
              firstName: "Eugenia",
              middleName: null,
              lastName: "Franecki",
              birthDate: "1939-10-11",
              street: "736 Jackson PI NW",
              streetTwo: "DC",
              city: null,
              state: "DC",
              zipCode: null,
              telephone: "(270) 867-5309",
              phoneNumbers: [
                {
                  type: "MOBILE",
                  number: "(270) 867-5309",
                },
              ],
              role: "UNKNOWN",
              emails: ["foo@bar.com"],
              county: null,
              race: null,
              ethnicity: null,
              gender: null,
              genderIdentity: null,
              residentCongregateSetting: true,
              employedInHealthcare: true,
              facility: null,
              testResultDelivery: null,
              tribalAffiliation: [null],
              notes: null,
            },
          },
        },
      },
    ];

    const elementToTest = (
      <EditPatient facilityId={mockFacilityID} patientId={mockPatientID} />
    );
    const elementToRender = createGQLWrappedMemoryRouterWithDataApis(
      elementToTest,
      store,
      mocks
    );
    const renderWithUser = () => ({
      user: userEvent.setup(),
      ...render(elementToRender),
    });

    const waitForDataLoad = async () => {
      expect(
        (await screen.findAllByText("Franecki, Eugenia", { exact: false }))[0]
      ).toBeInTheDocument();
    };

    beforeEach(async () => {
      MockDate.set("2021-08-01");
    });

    afterEach(() => {
      MockDate.reset();
    });

    it("matches screenshot", async () => {
      const { container } = renderWithUser();
      await waitForDataLoad();
      expect(container).toMatchSnapshot();
    });

    describe("facility select input", () => {
      it("updates its selection on change", async () => {
        const { user } = renderWithUser();
        await waitForDataLoad();
        const facilityInput = (await screen.findByLabelText("Facility", {
          exact: false,
        })) as HTMLSelectElement;
        expect(facilityInput.value).toBe("~~ALL-FACILITIES~~");

        await user.selectOptions(facilityInput, mockFacilityID);
        expect(facilityInput.value).toBe(mockFacilityID);
      });
    });
  });

  const mocks = [
    {
      request: {
        query: GET_PATIENT,
        variables: {
          id: mockPatientID,
        },
      },
      result: {
        data: {
          patient: {
            firstName: "Eugenia",
            middleName: null,
            lastName: "Franecki",
            birthDate: "1939-10-11",
            street: "736 Jackson PI NW",
            streetTwo: "DC",
            city: null,
            state: "DC",
            zipCode: null,
            telephone: "(270) 867-5309",
            phoneNumbers: [
              {
                type: "MOBILE",
                number: "(270) 867-5309",
              },
            ],
            role: "UNKNOWN",
            emails: ["foo@bar.com"],
            county: null,
            country: null,
            race: "refused",
            ethnicity: "refused",
            gender: "refused",
            genderIdentity: "refused",
            residentCongregateSetting: null,
            employedInHealthcare: null,
            facility: null,
            testResultDelivery: null,
            tribalAffiliation: [null],
          },
        },
      },
    },
  ];

  describe("non-answer and not sure options", () => {
    beforeEach(async () => {
      render(
        createGQLWrappedMemoryRouterWithDataApis(
          <EditPatient facilityId={mockFacilityID} patientId={mockPatientID} />,
          store,
          mocks,
          false
        )
      );
      expect(
        (await screen.findAllByText("Franecki, Eugenia", { exact: false }))[0]
      ).toBeInTheDocument();
    });

    it("shows prefer not to answer options", () => {
      [
        "Race",
        "Are you Hispanic or Latino?",
        "Sex assigned at birth",
        "What's your gender identity?",
      ].forEach((legend) => {
        const fieldset = screen.getByText(legend).closest("fieldset");
        if (fieldset === null) {
          throw Error(`Unable to corresponding fieldset for ${legend}`);
        }
        const option = within(fieldset).getByLabelText("Prefer not to answer");
        expect(option).toBeChecked();
      });
    });
    it("shows not sure answers", () => {
      ["group or shared housing facility", "health care"].forEach((legend) => {
        const fieldset = screen
          .getByText(legend, { exact: false })
          .closest("fieldset");
        if (fieldset === null) {
          throw Error(`Unable to corresponding fieldset for ${legend}`);
        }
        const option = within(fieldset).getByLabelText("Not sure");
        expect(option).toBeChecked();
      });
    });
  });

  describe("form validations", () => {
    const elementToRender = createGQLWrappedMemoryRouterWithDataApis(
      <EditPatient facilityId={mockFacilityID} patientId={mockPatientID} />,
      store,
      mocks,
      false
    );
    const renderWithUser = () => ({
      user: userEvent.setup(),
      ...render(elementToRender),
    });

    it("defaults to USA for a patient with country as null", async () => {
      renderWithUser();
      await screen.findAllByText("Franecki, Eugenia", { exact: false });
      expect(screen.getByLabelText("Country", { exact: false })).toHaveValue(
        "USA"
      );
    });
    it("shows validation errors", async () => {
      const { user } = renderWithUser();
      await screen.findAllByText("Franecki, Eugenia", { exact: false });
      const name = await screen.findByLabelText("First name", { exact: false });
      // Error message on bad value
      await user.clear(name);
      await user.tab();
      expect(
        await screen.findByText("First name is missing")
      ).toBeInTheDocument();
      // No error message on good value
      await user.type(name, "James");
      await user.tab();
      await waitFor(() => {
        expect(
          screen.queryByText("First name is missing")
        ).not.toBeInTheDocument();
      });
    });
  });
  describe("tribal tribal Affiliation null", () => {
    beforeEach(async () => {
      const mocksWithNull = [...mocks];
      (mocksWithNull[0].result.data.patient as any).tribalAffiliation = null;
      const elementToRender = createGQLWrappedMemoryRouterWithDataApis(
        <EditPatient facilityId={mockFacilityID} patientId={mockPatientID} />,
        store,
        mocksWithNull,
        false
      );
      render(elementToRender);
    });
    it("renders", async () => {
      expect(
        await screen.findByText("Franecki, Eugenia", { exact: false })
      ).toBeInTheDocument();
    });
  });
  describe("EditPatientContainer", () => {
    it("doesn't render if no facility is provided", async () => {
      const elementToRender = createGQLWrappedMemoryRouterWithDataApis(
        <EditPatientContainer />,
        store,
        mocks,
        true,
        "/patient/:patientId",
        [`/patient/5`]
      );
      render(elementToRender);
      expect(
        await screen.findByText("No facility selected", { exact: false })
      ).toBeInTheDocument();
    });
    it("renders EditPatient with valid params", async () => {
      const search = new URLSearchParams({
        facility: mockFacilityID,
        fromQueue: "true",
      });

      const elementToRender = createGQLWrappedMemoryRouterWithDataApis(
        <EditPatientContainer />,
        store,
        mocks,
        true,
        "/patient/:patientId",
        [
          {
            pathname: `/patient/${mockPatientID}`,
            search: search.toString(),
          },
        ]
      );

      render(elementToRender);
      expect(
        await screen.findByText("Franecki, Eugenia", { exact: false })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Franecki, Eugenia", { exact: false })
      ).toBeInTheDocument();
      expect(await screen.findByText("Conduct tests")).toBeInTheDocument();
    });
  });

  describe("edit patient from conduct tests page", () => {
    beforeEach(async () => {
      const elementToRender = createGQLWrappedMemoryRouterWithDataApis(
        <EditPatient
          facilityId={mockFacilityID}
          patientId={mockPatientID}
          fromQueue={true}
        />,
        store,
        mocks,
        false
      );
      render(elementToRender);
    });
    it("shows Conduct tests link and hides Save and start test button", async () => {
      expect(await screen.findByText("Conduct tests")).toBeInTheDocument();
      expect(screen.queryByText(PATIENT_TERM_CAP)).not.toBeInTheDocument();
      expect(screen.queryByText("Save and start test")).not.toBeInTheDocument();
    });
  });
});
