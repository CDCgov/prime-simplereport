import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";

import { getAppInsights } from "../../TelemetryService";
import * as srToast from "../../utils/srToast";
import { PhoneType } from "../../../generated/graphql";
import mockSupportedDiseaseCovid from "../mocks/mockSupportedDiseaseCovid";
import mockSupportedDiseaseMultiplex, {
  mockSupportedDiseaseFlu,
} from "../mocks/mockSupportedDiseaseMultiplex";

import TestCardForm, { TestCardFormProps } from "./TestCardForm";
import { QueriedFacility, QueriedTestOrder } from "./types";

jest.mock("../../TelemetryService", () => ({
  getAppInsights: jest.fn(),
}));

const setStartTestPatientIdMock = jest.fn();

const covidDeviceName = "LumiraDX";
const multiplexDeviceName = "Multiplex";
const multiplexAndCovidOnlyDeviceName = "MultiplexAndCovidOnly";
const fluDeviceName = "FLU";
const hivDeviceName = "HIV";

const covidDeviceId = "COVID-DEVICE-ID";
const multiplexDeviceId = "MULTIPLEX-DEVICE-ID";
const multiplexAndCovidOnlyDeviceId = "MULTIPLEX-COVID-DEVICE-ID";
const fluDeviceId = "FLU-DEVICE-ID";
const hivDeviceId = "HIV-DEVICE-ID";

const specimen1Name = "Swab of internal nose";
const specimen1Id = "SPECIMEN-1-ID";
const specimen2Name = "Nasopharyngeal swab";
const specimen2Id = "SPECIMEN-2-ID";

describe("TestCardForm", () => {
  let nowFn = Date.now;
  let alertSpy: jest.SpyInstance;
  const trackEventMock = jest.fn();
  const trackMetricMock = jest.fn();
  const trackExceptionMock = jest.fn();

  const testOrderInfo: QueriedTestOrder = {
    internalId: "1b02363b-ce71-4f30-a2d6-d82b56a91b39",
    dateAdded: "2022-11-08 13:33:07.503",
    symptoms:
      '{"64531003":"false","103001002":"false","84229001":"false","68235000":"false","426000000":"false","49727002":"false","68962001":"false","422587007":"false","267036007":"false","62315008":"false","43724002":"false","36955009":"false","44169009":"false","422400008":"false","230145002":"false","25064002":"false","162397003":"false"}',
    symptomOnset: null,
    noSymptoms: true,
    deviceType: {
      internalId: multiplexDeviceId,
      name: multiplexDeviceName,
      model: multiplexDeviceName,
      testLength: 15,
    },
    specimenType: {
      internalId: specimen1Id,
      name: specimen1Name,
      typeCode: "445297001",
    },
    patient: {
      internalId: "72b3ce1e-9d5a-4ad2-9ae8-e1099ed1b7e0",
      telephone: "(571) 867-5309",
      birthDate: "2015-09-20",
      firstName: "Althea",
      middleName: "Hedda Mclaughlin",
      lastName: "Dixon",
      gender: "refused",
      testResultDelivery: null,
      preferredLanguage: null,
      email: "sywaporoce@mailinator.com",
      emails: ["sywaporoce@mailinator.com"],
      phoneNumbers: [
        {
          type: PhoneType.Mobile,
          number: "(553) 223-0559",
        },
        {
          type: PhoneType.Landline,
          number: "(669) 789-0799",
        },
      ],
    },
    results: [],
    dateTested: null,
    correctionStatus: "ORIGINAL",
    reasonForCorrection: null,
  };

  const facilityInfo: QueriedFacility = {
    id: "f02cfff5-1921-4293-beff-e2a5d03e1fda",
    name: "Testing Site",
    deviceTypes: [
      {
        internalId: covidDeviceId,
        name: covidDeviceName,
        testLength: 15,
        supportedDiseaseTestPerformed: mockSupportedDiseaseCovid,
        swabTypes: [
          {
            name: specimen1Name,
            internalId: specimen1Id,
            typeCode: "445297001",
          },
          {
            name: specimen2Name,
            internalId: specimen2Id,
            typeCode: "258500001",
          },
        ],
      },
      {
        internalId: multiplexDeviceId,
        name: multiplexDeviceName,
        testLength: 15,
        supportedDiseaseTestPerformed: mockSupportedDiseaseMultiplex,
        swabTypes: [
          {
            name: specimen1Name,
            internalId: specimen1Id,
            typeCode: "445297001",
          },
          {
            name: specimen2Name,
            internalId: specimen2Id,
            typeCode: "258500001",
          },
        ],
      },
      {
        internalId: fluDeviceId,
        name: fluDeviceName,
        testLength: 15,
        supportedDiseaseTestPerformed: [...mockSupportedDiseaseFlu],
        swabTypes: [
          {
            name: specimen1Name,
            internalId: specimen1Id,
            typeCode: "445297001",
          },
          {
            name: specimen2Name,
            internalId: specimen2Id,
            typeCode: "258500001",
          },
        ],
      },
      {
        internalId: multiplexAndCovidOnlyDeviceId,
        name: multiplexAndCovidOnlyDeviceName,
        testLength: 15,
        supportedDiseaseTestPerformed: [
          ...mockSupportedDiseaseFlu,
          {
            supportedDisease: mockSupportedDiseaseCovid[0].supportedDisease,
            testPerformedLoincCode: "123456",
            testOrderedLoincCode: "445566",
          },
          {
            supportedDisease: mockSupportedDiseaseCovid[0].supportedDisease,
            testPerformedLoincCode: "123456",
            testOrderedLoincCode: "778899",
          },
        ],
        swabTypes: [
          {
            name: specimen1Name,
            internalId: specimen1Id,
            typeCode: "445297001",
          },
          {
            name: specimen2Name,
            internalId: specimen2Id,
            typeCode: "258500001",
          },
        ],
      },
    ],
  };

  const devicesMap = new Map();
  facilityInfo.deviceTypes.map((d) => devicesMap.set(d.internalId, d));

  const testProps: TestCardFormProps = {
    refetchQueue: jest.fn().mockReturnValue(null),
    testOrder: testOrderInfo,
    facility: facilityInfo,
    devicesMap: devicesMap,
    startTestPatientId: "",
    setStartTestPatientId: setStartTestPatientIdMock,
  };

  type testRenderProps = {
    props?: TestCardFormProps;
    mocks?: any;
  };

  async function renderTestCardForm(
    { props, mocks }: testRenderProps = { props: testProps, mocks: [] }
  ) {
    props = props || testProps;
    const view = render(
      <>
        <MockedProvider
          mocks={mocks}
          addTypename={true}
          defaultOptions={{
            query: { fetchPolicy: "no-cache" },
            mutate: { fetchPolicy: "no-cache" },
          }}
          showWarnings={false}
        >
          <TestCardForm
            refetchQueue={props.refetchQueue}
            testOrder={props.testOrder}
            startTestPatientId={props.startTestPatientId}
            setStartTestPatientId={props.setStartTestPatientId}
            facility={props.facility}
            devicesMap={props.devicesMap}
          />
        </MockedProvider>
      </>
    );
    return { user: userEvent.setup(), ...view };
  }

  beforeEach(() => {
    (getAppInsights as jest.Mock).mockImplementation(() => ({
      trackEvent: trackEventMock,
      trackMetric: trackMetricMock,
      trackException: trackExceptionMock,
    }));
    // jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(global.Math, "random").mockReturnValue(1);
    alertSpy = jest.spyOn(srToast, "showError");
  });

  afterEach(() => {
    Date.now = nowFn;
    (getAppInsights as jest.Mock).mockReset();
    jest.spyOn(console, "error").mockRestore();
    jest.spyOn(global.Math, "random").mockRestore();
    alertSpy.mockRestore();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("initial state", () => {
    it("matches snapshot for covid device", async () => {
      const props = {
        ...testProps,
        testOrder: {
          ...testProps.testOrder,
          results: [
            { testResult: "POSITIVE", disease: { name: "COVID-19" } },
            { testResult: "POSITIVE", disease: { name: "Flu A" } },
            { testResult: "POSITIVE", disease: { name: "Flu B" } },
          ],
          deviceType: {
            internalId: covidDeviceId,
            name: covidDeviceName,
            model: covidDeviceName,
            testLength: 15,
          },
        },
      };

      expect(await renderTestCardForm({ props })).toMatchSnapshot();
    });

    it("matches snapshot for multiplex device", async () => {
      const props = {
        ...testProps,
        testOrder: {
          ...testProps.testOrder,
          results: [
            { testResult: "NEGATIVE", disease: { name: "COVID-19" } },
            { testResult: "NEGATIVE", disease: { name: "Flu A" } },
            { testResult: "NEGATIVE", disease: { name: "Flu B" } },
          ],
          deviceType: {
            internalId: multiplexDeviceId,
            name: multiplexDeviceName,
            model: multiplexDeviceName,
            testLength: 15,
          },
        },
      };

      expect(await renderTestCardForm({ props })).toMatchSnapshot();
    });

    it("matches snapshot for flu device", async () => {
      const props = {
        ...testProps,
        testOrder: {
          ...testProps.testOrder,
          results: [
            { testResult: "UNDETERMINED", disease: { name: "COVID-19" } },
            { testResult: "UNDETERMINED", disease: { name: "Flu A" } },
            { testResult: "UNDETERMINED", disease: { name: "Flu B" } },
          ],
          deviceType: {
            internalId: fluDeviceId,
            name: fluDeviceName,
            model: fluDeviceName,
            testLength: 15,
          },
        },
      };

      const { container } = await renderTestCardForm({ props });

      expect(container).toMatchSnapshot();
    });

    it("matches snapshot for hiv device", async () => {
      const props = {
        ...testProps,
        testOrder: {
          ...testProps.testOrder,
          results: [{ testResult: "UNDETERMINED", disease: { name: "HIV" } }],
          deviceType: {
            internalId: hivDeviceId,
            name: hivDeviceName,
            model: hivDeviceName,
            testLength: 15,
          },
        },
      };

      expect(await renderTestCardForm({ props })).toMatchSnapshot();
    });
  });

  describe("error handling", () => {
    it("should show error when no results are filled in", async () => {
      const props = {
        ...testProps,
        testOrder: {
          ...testProps.testOrder,
          results: [
            { testResult: "UNKNOWN", disease: { name: "COVID-19" } },
            { testResult: "UNKNOWN", disease: { name: "Flu A" } },
            { testResult: "UNKNOWN", disease: { name: "Flu B" } },
          ],
        },
      };

      const { user } = await renderTestCardForm({ props });

      // Submit to start form validation
      await user.click(screen.getByText("Submit results"));

      expect(
        screen.getByText("Please enter a valid test result.")
      ).toBeInTheDocument();
    });
  });
});
