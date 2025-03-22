import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import MaintenanceBannerWrapper from "./MaintenanceBannerWrapper";

const MockPatientApp = () => <div data-testid="patient-app">Patient App</div>;
const MockReportingApp = () => (
  <div data-testid="reporting-app">Reporting App</div>
);
const MockSignUpApp = () => <div data-testid="signup-app">Sign Up App</div>;
const MockSelfRegistration = () => (
  <div data-testid="self-registration">Self Registration</div>
);

const TestRoutes = () => (
  <Routes>
    <Route
      path="/pxp/*"
      element={
        <MaintenanceBannerWrapper>
          <MockPatientApp />
        </MaintenanceBannerWrapper>
      }
    />
    <Route
      path="/sign-up/*"
      element={
        <MaintenanceBannerWrapper>
          <MockSignUpApp />
        </MaintenanceBannerWrapper>
      }
    />
    <Route
      path="/register/:registrationLink"
      element={
        <MaintenanceBannerWrapper>
          <MockSelfRegistration />
        </MaintenanceBannerWrapper>
      }
    />
    <Route
      path="/*"
      element={
        <MaintenanceBannerWrapper>
          <MockReportingApp />
        </MaintenanceBannerWrapper>
      }
    />
  </Routes>
);

global.fetch = jest.fn();

describe("Maintenance Banner working correctly", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_DISABLE_MAINTENANCE_BANNER = undefined;
  });

  it("shows maintenance banner with patient app content when maintenance is active", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        active: true,
        header: "System Maintenance",
        message: "The system is undergoing maintenance",
      }),
    });

    render(
      <MemoryRouter initialEntries={["/pxp/dashboard"]}>
        <TestRoutes />
      </MemoryRouter>
    );

    expect(screen.getByTestId("patient-app")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("System Maintenance", { exact: false })
      ).toBeInTheDocument();
    });
  });

  it("shows maintenance banner with sign-up app content when maintenance is active", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        active: true,
        header: "System Maintenance",
        message: "The system is undergoing maintenance",
      }),
    });

    render(
      <MemoryRouter initialEntries={["/sign-up/start"]}>
        <TestRoutes />
      </MemoryRouter>
    );

    expect(screen.getByTestId("signup-app")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("System Maintenance", { exact: false })
      ).toBeInTheDocument();
    });
  });

  it("shows maintenance banner with registration page when maintenance is active", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        active: true,
        header: "System Maintenance",
        message: "The system is undergoing maintenance",
      }),
    });

    render(
      <MemoryRouter initialEntries={["/register/abc123"]}>
        <TestRoutes />
      </MemoryRouter>
    );

    expect(screen.getByTestId("self-registration")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("System Maintenance", { exact: false })
      ).toBeInTheDocument();
    });
  });

  it("shows maintenance banner with reporting app content when maintenance is active", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        active: true,
        header: "System Maintenance",
        message: "The system is undergoing maintenance",
      }),
    });

    render(
      <MemoryRouter initialEntries={["/reports"]}>
        <TestRoutes />
      </MemoryRouter>
    );

    expect(screen.getByTestId("reporting-app")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("System Maintenance", { exact: false })
      ).toBeInTheDocument();
    });
  });

  it("does not show maintenance banner when banner is disabled", () => {
    process.env.REACT_APP_DISABLE_MAINTENANCE_BANNER = "true";

    render(
      <MemoryRouter initialEntries={["/reports"]}>
        <TestRoutes />
      </MemoryRouter>
    );

    expect(screen.getByTestId("reporting-app")).toBeInTheDocument();

    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not show maintenance banner when maintenance is not active", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        active: false,
        header: "System Maintenance",
        message: "The system is undergoing maintenance",
      }),
    });

    render(
      <MemoryRouter initialEntries={["/pxp/dashboard"]}>
        <TestRoutes />
      </MemoryRouter>
    );

    expect(screen.getByTestId("patient-app")).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
