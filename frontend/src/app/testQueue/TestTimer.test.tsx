import { act, fireEvent, render, screen } from "@testing-library/react";

import {
  findTimer,
  removeTimer,
  TestTimerWidget,
  Timer,
  TimerTrackEventMetadata,
  useTestTimer,
} from "./TestTimer";

jest.mock("../TelemetryService", () => ({
  appInsights: {
    trackEvent: jest.fn(),
  },
}));

describe("TestTimer", () => {
  let now = 1600000000;
  let internalId = "internal-id";
  it("starts the timer with the expected values", () => {
    let timer: Timer = new Timer(internalId, 15);
    timer.start(now);
    expect(timer.startedAt).toBe(now);
    expect(timer.alarmAt).toBe(now + 15 * 60 * 1000);
  });
  it("resets the timer with the expected values", () => {
    let timer: Timer = new Timer(internalId, 15);
    timer.start(now);
    // 10 seconds have passed
    timer.tick(now + 10000);
    testCountdown(timer.countdown, 14, 50);

    timer.reset();
    testCountdown(timer.countdown, 15, 0);
    expect(timer.alarmAt).toBe(0);
    expect(timer.startedAt).toBe(0);
  });
  it("adjusts values when timer hasn't started and test length changes", () => {
    let timer: Timer = new Timer(internalId, 10);
    timer.update(15);
    expect(timer.testLength).toBe(15);
    expect(timer.countdown).toBe(15 * 60 * 1000);
  });
  it("adjust values when timer has started and test length increases", () => {
    let timer: Timer = new Timer(internalId, 10);
    timer.start(now);

    // one second has passed
    timer.tick(now + 1000);
    testCountdown(timer.countdown, 9, 59);

    // change to a 15 minute test
    timer.update(15);
    testCountdown(timer.countdown, 14, 59);
  });
  it("adjust values when timer has started and test length decreases", () => {
    let timer: Timer = new Timer(internalId, 15);
    timer.start(now);

    // two seconds passed
    timer.tick(now + 2000);
    testCountdown(timer.countdown, 14, 58);

    // change to a 10 minute test
    timer.update(10);
    testCountdown(timer.countdown, 9, 58);
  });
});

describe("TestTimerWidget", () => {
  describe("telemetry", () => {
    let context: TimerTrackEventMetadata;

    beforeEach(() => {
      context = {
        patientId: "patient-id",
        organizationName: "Organization",
        facilityName: "Facility",
        testOrderId: "test-order-id",
      };
    });

    afterEach(() => removeTimer("internal-id"));

    it("tracks a custom event when the timer is started", async () => {
      const { appInsights } = require("../TelemetryService");

      render(<DummyTestTimer testLength={15} context={context} />);

      const startTimer = await screen.findByRole("button");

      act(() => {
        fireEvent.click(startTimer);
      });

      expect(appInsights?.trackEvent).toHaveBeenCalled();
      expect(appInsights?.trackEvent).toHaveBeenCalledTimes(1);
      expect(appInsights?.trackEvent).toHaveBeenCalledWith(
        { name: "Test timer started" },
        context
      );
    });

    it("tracks a custom event when the timer reset", async () => {
      const { appInsights } = require("../TelemetryService");

      render(<DummyTestTimer testLength={15} context={context} />);

      const timerButton = await screen.findByRole("button");

      // Start timer
      act(() => {
        fireEvent.click(timerButton);
      });

      // The timer does not enter the countdown state instantly, so clicking the
      // button in rapid succession will register as two "start timer" events.
      // Force the timer forward -- otherwise we would need a 1sec timeout here
      findTimer("internal-id")?.tick(Date.now());

      // Reset timer
      act(() => {
        fireEvent.click(timerButton);
      });

      expect(appInsights?.trackEvent).toHaveBeenCalledWith(
        { name: "Test timer reset" },
        context
      );
    });

    it("tracks a custom event when the timer reaches zero", async () => {
      const { appInsights } = require("../TelemetryService");

      render(<DummyTestTimer testLength={0} context={context} />);

      const timerButton = await screen.findByRole("button");

      act(() => {
        fireEvent.click(timerButton);
      });

      // This is a 0-second timer, but it takes ~1 second to enter the
      // countdown state and register as completed
      findTimer("internal-id")?.tick(Date.now() + 1000);

      expect(screen.getByText("RESULT READY")).toBeInTheDocument();

      expect(appInsights?.trackEvent).toHaveBeenCalledWith(
        { name: "Test timer finished" },
        context
      );
    });
  });
});

function DummyTestTimer(props: {
  testLength: number;
  context: TimerTrackEventMetadata;
}) {
  const timer = useTestTimer("internal-id", props.testLength);

  return <TestTimerWidget timer={timer} context={props.context} />;
}

function testCountdown(actualMillis: number, mins: number, secs: number) {
  const actualMins = Math.floor(Math.abs(actualMillis) / (60 * 1000));
  const actualSecs = (Math.abs(actualMillis) % (60 * 1000)) / 1000;
  expect(actualMins).toBe(mins);
  expect(actualSecs).toBe(secs);
}
