// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import React from "react";
import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import "jest-location-mock";
import ReactModal from "react-modal";
import moment from "moment";

fetchMock.enableMocks();

jest.mock("@microsoft/applicationinsights-react-js", () => {
  return {
    useAppInsightsContext: jest.fn(),
    useTrackEvent: () => jest.fn(),
    withAITracking: jest
      .fn()
      .mockImplementation((reactPlugin, Component) => <Component />),
    ReactPlugin: Object,
  };
});

ReactModal.setAppElement("*"); // suppresses modal-related test warnings.

// Disable moment warnings
moment.suppressDeprecationWarnings = true;

// This prevents tests from timing out and causing this error in CI:
// TypeError: Cannot read property 'createEvent' of null
jest.setTimeout(30000);
