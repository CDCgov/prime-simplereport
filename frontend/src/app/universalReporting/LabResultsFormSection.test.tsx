import configureStore, { MockStoreEnhanced } from "redux-mock-store";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";

import { GetAllLabsDocument } from "../../generated/graphql";

import LabResultsFormSection from "./LabResultsFormSection";
import { defaultSpecimenReportInputState } from "./LabReportFormUtils";

describe("LabResultsFormSection", () => {
  let store: MockStoreEnhanced<unknown, {}>;
  const mockStore = configureStore([]);

  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(new Date("2025-09-15").getTime());

    store = mockStore({
      organization: {
        name: "Organization Name",
      },
      facilities: [
        {
          id: "a1",
          name: "Fake Facility",
        },
      ],
      user: {
        permissions: [],
      },
    });
  });

  it("renders successfully after loading", async () => {
    const { container } = render(
      <MemoryRouter>
        <MockedProvider mocks={mocks}>
          <Provider store={store}>
            <LabResultsFormSection
              specimen={defaultSpecimenReportInputState}
              setSpecimen={() => {}}
              testDetailList={[]}
              setTestDetailList={() => {}}
            />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText("Loading test orders..."));

    expect(
      await screen.findByText("Choose a specimen type to enter test results")
    );
    expect(
      await screen.findByText(
        "Please select test order and specimen type above to see test result information"
      )
    );
    expect(container).toMatchSnapshot();
  });
});

const mocks = [
  {
    request: {
      query: GetAllLabsDocument,
    },
    result: {
      data: {
        labs: [
          {
            code: "101289-7",
            description: null,
            display:
              "SARS-CoV-2 (COVID-19) RNA [Presence] in Throat by NAA with non-probe detection",
            longCommonName:
              "SARS-CoV-2 (COVID-19) RNA [Presence] in Throat by NAA with non-probe detection",
            scaleCode: "LP7751-3",
            scaleDisplay: "Ord",
            systemCode: "LP7633-3",
            systemDisplay: "Thrt",
            answerList: "LL360-9",
            orderOrObservation: "Both",
            panel: false,
          },
          {
            code: "8023-4",
            description: null,
            display:
              "Saint Louis encephalitis virus Ab [Presence] in Serum by Immunoassay",
            longCommonName:
              "Saint Louis encephalitis virus Ab [Presence] in Serum by Immunoassay",
            scaleCode: "LP7751-3",
            scaleDisplay: "Ord",
            systemCode: "LP7567-3",
            systemDisplay: "Ser",
            answerList: "",
            orderOrObservation: "Both",
            panel: false,
          },
        ],
      },
    },
  },
];
