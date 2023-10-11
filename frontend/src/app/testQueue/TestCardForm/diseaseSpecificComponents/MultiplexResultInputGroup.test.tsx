import React from "react";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { within } from "@storybook/testing-library";

import mockSupportedDiseaseCovid from "../../mocks/mockSupportedDiseaseCovid";
import { mockSupportedDiseaseFlu } from "../../mocks/mockSupportedDiseaseMultiplex";

import MultiplexResultInputGroup from "./MultiplexResultInputGroup";

describe("MultiplexResultInputGroup", () => {
  const onChangeMock = jest.fn();
  const queueItemId = "QUEUE-ITEM-ID";

  const specimen1Name = "Swab of internal nose";
  const specimen1Id = "SPECIMEN-1-ID";
  const specimen2Name = "Nasopharyngeal swab";
  const specimen2Id = "SPECIMEN-2-ID";
  const multiplexDeviceId = "DEVICE-1-ID";
  const fluOnlyDeviceId = "DEVICE-2-ID";

  const positiveTestResults = [
    { diseaseName: "COVID-19", testResult: "POSITIVE" },
    { diseaseName: "Flu A", testResult: "POSITIVE" },
    { diseaseName: "Flu B", testResult: "POSITIVE" },
  ];

  const negativeTestResults = [
    { diseaseName: "COVID-19", testResult: "NEGATIVE" },
    { diseaseName: "Flu A", testResult: "NEGATIVE" },
    { diseaseName: "Flu B", testResult: "NEGATIVE" },
  ];

  const inconclusiveTestResults = [
    { diseaseName: "COVID-19", testResult: "UNDETERMINED" },
    { diseaseName: "Flu A", testResult: "UNDETERMINED" },
    { diseaseName: "Flu B", testResult: "UNDETERMINED" },
  ];

  const deviceTypes = [
    {
      internalId: multiplexDeviceId,
      name: "LumiraDX",
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
      internalId: fluOnlyDeviceId,
      name: "Abbott BinaxNow",
      testLength: 15,
      supportedDiseaseTestPerformed: mockSupportedDiseaseFlu,
      swabTypes: [
        {
          name: specimen1Name,
          internalId: specimen1Id,
          typeCode: "445297001",
        },
      ],
    },
  ];

  const devicesMap = new Map();
  deviceTypes.map((d) => devicesMap.set(d.internalId, d));

  async function renderMultiplexResultInputGroup(
    deviceId?: string,
    testResults?: any
  ) {
    jest.spyOn(global.Math, "random").mockReturnValue(1);

    const { container } = render(
      <MultiplexResultInputGroup
        queueItemId={queueItemId}
        testResults={testResults || positiveTestResults}
        deviceId={deviceId || multiplexDeviceId}
        devicesMap={devicesMap}
        onChange={onChangeMock}
      ></MultiplexResultInputGroup>
    );
    return { container, user: userEvent.setup() };
  }

  describe("initial state snapshots", () => {
    it("matches positive results snapshot", async () => {
      expect(
        await renderMultiplexResultInputGroup(
          multiplexDeviceId,
          positiveTestResults
        )
      ).toMatchSnapshot();
    });

    it("matches negative result snapshot", async () => {
      expect(
        await renderMultiplexResultInputGroup(
          multiplexDeviceId,
          negativeTestResults
        )
      ).toMatchSnapshot();
    });

    it("matches inconclusive result snapshot", async () => {
      expect(
        await renderMultiplexResultInputGroup(
          multiplexDeviceId,
          inconclusiveTestResults
        )
      ).toMatchSnapshot();
    });

    it("matches flu only snapshot", async () => {
      expect(
        await renderMultiplexResultInputGroup(fluOnlyDeviceId, [
          { diseaseName: "Flu A", testResult: "UNDETERMINED" },
          { diseaseName: "Flu B", testResult: "UNDETERMINED" },
        ])
      ).toMatchSnapshot();
    });
  });

  it("calls onChange when result selected", async () => {
    const { user } = await renderMultiplexResultInputGroup(
      multiplexDeviceId,
      positiveTestResults
    );

    // selecting a negative covid result
    onChangeMock.mockReset();
    await user.click(
      within(
        screen.getByTestId(`covid-test-result-${queueItemId}`)
      ).getByLabelText("Negative (-)")
    );
    expect(onChangeMock).toHaveBeenCalledWith([
      { diseaseName: "COVID-19", testResult: "NEGATIVE" },
      { diseaseName: "Flu A", testResult: "POSITIVE" },
      { diseaseName: "Flu B", testResult: "POSITIVE" },
    ]);

    // selecting a negative flu a result
    onChangeMock.mockReset();
    await user.click(
      within(
        screen.getByTestId(`flu-a-test-result-${queueItemId}`)
      ).getByLabelText("Negative (-)")
    );
    expect(onChangeMock).toHaveBeenCalledWith([
      { diseaseName: "COVID-19", testResult: "NEGATIVE" },
      { diseaseName: "Flu A", testResult: "NEGATIVE" },
      { diseaseName: "Flu B", testResult: "POSITIVE" },
    ]);

    // selecting a negative flu b result
    onChangeMock.mockReset();
    await user.click(
      within(
        screen.getByTestId(`flu-b-test-result-${queueItemId}`)
      ).getByLabelText("Negative (-)")
    );
    expect(onChangeMock).toHaveBeenCalledWith([
      { diseaseName: "COVID-19", testResult: "NEGATIVE" },
      { diseaseName: "Flu A", testResult: "NEGATIVE" },
      { diseaseName: "Flu B", testResult: "NEGATIVE" },
    ]);

    // selecting an inconclusive result
    onChangeMock.mockReset();
    await user.click(screen.getByLabelText("Mark test as inconclusive"));

    expect(onChangeMock).toHaveBeenCalledWith([
      { diseaseName: "COVID-19", testResult: "UNDETERMINED" },
      { diseaseName: "Flu A", testResult: "UNDETERMINED" },
      { diseaseName: "Flu B", testResult: "UNDETERMINED" },
    ]);
  });

  it("doesnt show covid result input with flu only device", async () => {
    await renderMultiplexResultInputGroup(fluOnlyDeviceId);

    expect(
      screen.queryByTestId(`covid-test-result-${queueItemId}`)
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId(`flu-a-test-result-${queueItemId}`)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`flu-b-test-result-${queueItemId}`)
    ).toBeInTheDocument();
  });
});
