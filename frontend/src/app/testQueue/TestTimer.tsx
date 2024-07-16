import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStopwatch, faRedo } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

import "./TestTimer.scss";
import { getAppInsights } from "../TelemetryService";

const alarmModule = require("./test-timer.mp3");

const alarmSound = new Audio(alarmModule.default || alarmModule);

type DateTimeStamp = ReturnType<typeof Date.now>;

function toMillis(minutes: number) {
  return minutes * 60 * 1000;
}

export interface TimerTrackEventMetadata {
  facilityName: string | undefined;
  organizationName: string;
  patientId: string;
  testOrderId: string;
}

export class Timer {
  id: string;
  startedAt: DateTimeStamp;
  alarmAt: DateTimeStamp;
  testLength: number;
  countdown: number;
  elapsed: number;
  alarmed: boolean;
  notify?: (value: number) => any;

  constructor(id: string, testLength: number, startedAt: number = 0) {
    this.id = id;
    this.startedAt = startedAt;
    this.alarmAt = 0;
    this.testLength = testLength;
    this.countdown = toMillis(testLength);
    this.elapsed = 0;
    this.alarmed = false;
  }

  fromJSON(obj: any) {
    this.id = obj.id;
    this.startedAt = obj.startedAt;
    this.alarmAt = obj.alarmAt;
    this.testLength = obj.testLength;
    this.countdown = obj.countdown;
    this.elapsed = obj.elapsed;
    this.alarmed = obj.alarmed;
    this.notify = obj.notify;
  }

  start(now: number) {
    this.startedAt = now;
    this.alarmAt = this.startedAt + toMillis(this.testLength);
  }

  setStartedAt(startedAt: number) {
    this.startedAt = startedAt;
    this.alarmAt = this.startedAt + toMillis(this.testLength);
    this.elapsed = Date.now() - this.startedAt;
  }

  reset() {
    this.startedAt = 0;
    this.alarmAt = 0;
    this.countdown = toMillis(this.testLength);
    this.elapsed = 0;
    this.alarmed = false;
  }

  // Updates the timer when the length of test changes (used for device changes.)
  update(testLength: number) {
    if (testLength === this.testLength) {
      return;
    }
    if (!this.startedAt) {
      this.testLength = testLength;
      this.countdown = toMillis(testLength);
      return;
    }
    const difference = toMillis(Math.abs(this.testLength - testLength));
    if (this.testLength > testLength) {
      this.countdown = this.countdown - difference;
      this.alarmAt = this.alarmAt - difference;
    } else {
      this.countdown = this.countdown + difference;
      this.alarmAt = this.alarmAt + difference;
    }
    this.testLength = testLength;
  }

  tick(now: number) {
    if (!this.startedAt) {
      return;
    }
    this.countdown = Math.round(this.alarmAt - now);
    this.elapsed = now - this.startedAt;
    if (this.notify) {
      this.notify(this.countdown);
    }
    if (!this.alarmed && this.alarmAt <= now) {
      this.alarmed = true;
      alarmSound.play();
    }
  }
}

const timerFromJSON = (obj: any) => {
  const timer = new Timer(obj.id, obj.testLength);
  timer.fromJSON(obj);
  return timer;
};

// Initialize an empty list of timers.
const timers: Timer[] = [];

const tickTimers = () => {
  const now = Date.now();
  timers.forEach((t) => {
    t.tick(now);
  });
};

const saveTimers = () => {
  localStorage.setItem("timers", JSON.stringify(timers));
};

// On load, retrieve timers from localStorage and prune them;
// only keep running timers that aren't super stale.
// Then start the timer tick.
{
  let oldTimers: Timer[] = [];
  try {
    const storage = localStorage.getItem("timers") || "[]";
    const cutoff = Date.now() - toMillis(60);
    oldTimers = JSON.parse(storage).filter((t: any) => t.alarmAt > cutoff);
  } catch (e: any) {}
  oldTimers.forEach((t) => {
    timers.push(timerFromJSON(t));
  });
  saveTimers();
  window.setInterval(tickTimers, 1000);
}

export const findTimer = (id: string): Timer | undefined =>
  timers.find((t) => t.id === id);

const addTimer = (id: string, testLength: number): Timer => {
  const newTimer = new Timer(id, testLength);
  timers.push(newTimer);
  saveTimers();
  return newTimer;
};

export const updateTimer = (id: string, testLength: number): Timer => {
  const timer: Timer = findTimer(id) || addTimer(id, testLength);
  timer.update(testLength);
  saveTimers();
  return timer;
};

export const removeTimer = (id: string) => {
  const index = timers.findIndex((t) => t.id === id);
  if (index >= 0) {
    timers.splice(index, 1);
    saveTimers();
  }
};

export const useTestTimer = (
  id: string,
  testLength: number,
  startedAt?: number
) => {
  const [, setCount] = useState(0);
  const existingTimer = findTimer(id);
  if (existingTimer && (startedAt === null || startedAt === undefined)) {
    // if timer already exists and startedAt is null or undefined,
    // then reset the timer
    existingTimer.reset();
    saveTimers();
  }
  const timer: Timer = findTimer(id) || addTimer(id, testLength);
  if (!!startedAt) {
    timer.setStartedAt(startedAt);
  }
  useEffect(() => {
    timer.notify = setCount;
    return () => {
      timer.notify = undefined;
    };
  }, [id, timer]);
  return {
    running: timer.startedAt !== 0,
    countdown: Math.round(
      (timer.startedAt ? timer.countdown : toMillis(timer.testLength)) / 1000
    ),
    elapsed: Math.round(timer.elapsed / 1000),
    startedAt: timer.startedAt,
    start: (trackClickEvent: Function) => {
      const timerToStart: Timer = findTimer(id) || addTimer(id, testLength);
      timerToStart.start(Date.now());
      saveTimers();
      trackClickEvent();
    },
    reset: (trackClickEvent: Function) => {
      const timerToReset = findTimer(id);
      if (timerToReset) {
        // reset the timer
        timerToReset.reset();
        // force final update
        setCount(toMillis(testLength));
        saveTimers();
        trackClickEvent();
      }
    },
  };
};

export const mmss = (t: number) => {
  const mins = Math.floor(Math.abs(t) / 60);
  const secs = Math.abs(t) % 60;
  return `${mins}:${("0" + secs).slice(-2)}`;
};

type Props = {
  timer: ReturnType<typeof useTestTimer>;
  context: TimerTrackEventMetadata;
  saveStartedAtCallback: (startedAt: number | undefined) => void;
};

export const TestTimerWidget = ({
  timer,
  context,
  saveStartedAtCallback,
}: Props) => {
  const { running, countdown, elapsed, start, reset } = timer;
  const [timerFinished, setTimerFinished] = useState(false);

  const appInsights = getAppInsights();

  const trackTimerStart = () => {
    if (appInsights) {
      appInsights.trackEvent({ name: "Test timer started" }, context);
    }
  };
  const trackTimerReset = () => {
    if (appInsights) {
      appInsights.trackEvent({ name: "Test timer reset" }, context);
    }
  };
  const trackTimerFinish = () => {
    if (appInsights) {
      appInsights.trackEvent({ name: "Test timer finished" }, context);
    }
  };

  if (!running) {
    return (
      <button
        className="timer-button timer-reset"
        onClick={() => {
          start(trackTimerStart);
          const timerToReset = findTimer(context.testOrderId);
          saveStartedAtCallback(timerToReset?.startedAt);
        }}
        data-testid="timer"
        aria-label="Start timer"
      >
        <FontAwesomeIcon alt-text="stopwatch" icon={faStopwatch as IconProp} />
        <span className={"margin-left-1"} role="timer">
          Start timer
        </span>{" "}
      </button>
    );
  }
  if (countdown >= 0) {
    return (
      <button
        className="timer-button timer-running"
        onClick={() => {
          reset(trackTimerReset);
          saveStartedAtCallback(undefined);
        }}
        data-testid="timer"
        aria-label="Reset timer"
      >
        <FontAwesomeIcon alt-text="reset" icon={faRedo as IconProp} />
        <span role="timer">{mmss(countdown)}</span>{" "}
      </button>
    );
  }

  if (!timerFinished) {
    trackTimerFinish();

    setTimerFinished(true);
  }

  return (
    <div>
      <button
        className="timer-button timer-ready"
        onClick={() => {
          reset(trackTimerReset);
          saveStartedAtCallback(undefined);
        }}
        data-testid="timer"
        aria-label="Reset timer"
      >
        <span className="result-ready">
          <strong>RESULT READY</strong>
        </span>{" "}
        <span className="timer-overtime margin-x-1" role="timer">
          {mmss(elapsed)} elapsed{" "}
        </span>{" "}
        <FontAwesomeIcon icon={faRedo as IconProp} />
      </button>
    </div>
  );
};
