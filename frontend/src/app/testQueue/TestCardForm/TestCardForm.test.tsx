import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";

import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../../testResults/constants";
import {
  asymptomaticTestOrderInfo,
  chlamydiaDeviceId,
  chlamydiaDeviceName,
  covidDeviceId,
  covidDeviceName,
  devicesMap,
  facilityInfo,
  fluDeviceId,
  fluDeviceName,
  generateSubmitQueueMock,
  gonorrheaDeviceId,
  gonorrheaDeviceName,
  hepatitisCDeviceId,
  hepatitisCDeviceName,
  hivDeviceId,
  hivDeviceName,
  multiplexDeviceId,
  multiplexDeviceName,
  syphilisDeviceId,
  syphilisDeviceName,
} from "../testCardTestConstants";

import TestCardForm, { TestCardFormProps } from "./TestCardForm";

jest.mock("../../TelemetryService", () => ({
  getAppInsights: jest.fn(),
}));

const setStartTestPatientIdMock = jest.fn();

describe("TestCardForm", () => {
  const testProps: TestCardFormProps = {
    refetchQueue: jest.fn().mockReturnValue(null),
    testOrder: asymptomaticTestOrderInfo,
    facility: facilityInfo,
    devicesMap: devicesMap,
    startTestPatientId: "f2dde6ff-52bc-4a6c-9946-f48724f46e6e",
    setStartTestPatientId: setStartTestPatientIdMock,
  };

  type testRenderProps = {
    props?: TestCardFormProps;
    mocks?: any;
  };

  async function renderTestCardForm({ props, mocks }: testRenderProps) {
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
    jest.spyOn(global.Math, "random").mockReturnValue(1);
  });

  afterEach(() => {
    jest.spyOn(global.Math, "random").mockRestore();
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

    it("matches snapshot for syphilis device", async () => {
      const props = {
        ...testProps,
        testOrder: {
          ...testProps.testOrder,
          results: [{ testResult: "POSITIVE", disease: { name: "SYPHILIS" } }],
          deviceType: {
            internalId: syphilisDeviceId,
            name: syphilisDeviceName,
            model: syphilisDeviceName,
            testLength: 15,
          },
        },
      };

      expect(await renderTestCardForm({ props })).toMatchSnapshot();
    });

    it("matches snapshot for hepatitis c device", async () => {
      const props = {
        ...testProps,
        testOrder: {
          ...testProps.testOrder,
          results: [
            { testResult: "POSITIVE", disease: { name: "HEPATITIS C" } },
          ],
          deviceType: {
            internalId: hepatitisCDeviceId,
            name: hepatitisCDeviceName,
            model: hepatitisCDeviceName,
            testLength: 15,
          },
        },
      };

      expect(await renderTestCardForm({ props })).toMatchSnapshot();
    });

    it("matches snapshot for gonorrhea device", async () => {
      const props = {
        ...testProps,
        testOrder: {
          ...testProps.testOrder,
          results: [{ testResult: "POSITIVE", disease: { name: "GONORRHEA" } }],
          deviceType: {
            internalId: gonorrheaDeviceId,
            name: gonorrheaDeviceName,
            model: gonorrheaDeviceName,
            testLength: 15,
          },
        },
      };

      expect(await renderTestCardForm({ props })).toMatchSnapshot();
    });

    it("matches snapshot for chlamydia device", async () => {
      const props = {
        ...testProps,
        testOrder: {
          ...testProps.testOrder,
          results: [{ testResult: "POSITIVE", disease: { name: "CHLAMYDIA" } }],
          deviceType: {
            internalId: chlamydiaDeviceId,
            name: chlamydiaDeviceName,
            model: chlamydiaDeviceName,
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

      const { user } = await renderTestCardForm({
        props,
      });

      // Submit to start form validation
      await user.click(screen.getByText("Submit results"));

      expect(
        screen.getByText("Please enter a valid test result.")
      ).toBeInTheDocument();
    });

    it("should show validation modal when COVID result is submitted without AOE results", async () => {
      const props = {
        ...testProps,
        testOrder: {
          ...testProps.testOrder,
          results: [{ testResult: "POSITIVE", disease: { name: "COVID-19" } }],
        },
      };

      const { user } = await renderTestCardForm({
        props,
        mocks: [
          generateSubmitQueueMock(
            MULTIPLEX_DISEASES.COVID_19,
            TEST_RESULTS.POSITIVE,
            {
              device: {
                deviceId: covidDeviceId,
              },
            }
          ),
        ],
      });

      // Submit to start form validation
      await user.click(screen.getByText("Submit results"));

      expect(
        screen.getByText("Do you want to submit results anyway?")
      ).toBeInTheDocument();

      await user.click(screen.getByText("Submit anyway."));
      expect(
        screen.queryByText("Do you want to submit results anyway?")
      ).not.toBeInTheDocument();
    });

    it("should show where tests are sent modal", async () => {
      const props = {
        ...testProps,
        testOrder: {
          ...testProps.testOrder,
          results: [{ testResult: "POSITIVE", disease: { name: "COVID-19" } }],
        },
      };

      const { user } = await renderTestCardForm({
        props,
        mocks: [
          generateSubmitQueueMock(
            MULTIPLEX_DISEASES.COVID_19,
            TEST_RESULTS.POSITIVE,
            {
              device: {
                deviceId: covidDeviceId,
              },
            }
          ),
        ],
      });

      // Submit to start form validation
      await user.click(screen.getByText("Where results are sent"));

      expect(
        screen.getByText("Where are SimpleReport test results sent?")
      ).toBeInTheDocument();

      await user.click(screen.getByText("Got it"));
      expect(
        screen.queryByText("Where are SimpleReport test results sent?")
      ).not.toBeInTheDocument();
    });

    it("shows sensitive topics modal", async () => {
      const props = {
        ...testProps,
        testOrder: {
          ...testProps.testOrder,
          results: [{ testResult: "POSITIVE", disease: { name: "SYPHILIS" } }],
          deviceType: {
            internalId: syphilisDeviceId,
            name: syphilisDeviceName,
            model: syphilisDeviceName,
            testLength: 15,
          },
        },
      };

      const { user } = await renderTestCardForm({ props });

      await user.click(
        screen.getByText(
          "Why SimpleReport asks about sensitive topics like this"
        )
      );

      expect(
        screen.getByText(
          "Why we ask for gender of sexual partners and other sensitive topics"
        )
      ).toBeInTheDocument();

      await user.click(screen.getByText("Got it"));
      expect(
        screen.queryByText(
          "Why we ask for gender of sexual partners and other sensitive topics"
        )
      ).not.toBeInTheDocument();
    });
  });
});
