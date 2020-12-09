import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStopwatch, faRedo } from "@fortawesome/free-solid-svg-icons";
import "./TestTimer.scss";

type DateTimeStamp = ReturnType<typeof Date.now>;
type TimerId = string;

type Timer = {
  id: TimerId;
  startedAt: DateTimeStamp;
  alarmAt: DateTimeStamp;
  countdown: number; // milliseconds
  elapsed: number; // milliseconds
  alarmed: boolean;
  notify?: (value: number) => any;
};

// Non-zero handle means we're ticking
let setIntervalHandle = 0;

// Starting timer value in milliseconds
const initialCount = 15 * 60 * 1000;

// Timer list
const timers: Timer[] = [];

// Initialized timer values, id is always created unique
const initialTimerValues: Omit<Timer, "id"> = {
  alarmAt: 0,
  startedAt: 0,
  countdown: initialCount,
  elapsed: 0,
  alarmed: false,
} as const;

const alarmSound = new Audio(require("./test-timer.mp3"));

const timerTick = () => {
  const now = Date.now();

  timers.forEach((t) => {
    if (!t.startedAt) {
      // Initial state or reset, not running
      return;
    }
    t.countdown = Math.round(t.alarmAt - now);
    t.elapsed = now - t.startedAt;
    if (t.notify) {
      t.notify(t.countdown);
    }
    if (!t.alarmed && t.alarmAt <= now) {
      t.alarmed = true;
      alarmSound.play();
    }
    // TODO: remove very stale timers?
  });
};

const findTimer = (id: TimerId): Timer | undefined =>
  timers.find((t) => t.id === id);
const addTimer = (id: TimerId): Timer => {
  const newTimer = { id, ...initialTimerValues };
  timers.push(newTimer);
  return newTimer;
};

export const useTestTimer = (id: string) => {
  const [, setCount] = useState(0);
  let timer = findTimer(id) || addTimer(id);
  useEffect(() => {
    timer.notify = setCount;
    if (!setIntervalHandle) {
      setIntervalHandle = window.setInterval(timerTick, 1000);
    }
    return () => {
      timer.notify = undefined;
    };
  }, [id, timer]);
  return {
    running: timer.startedAt !== 0,
    countdown: Math.round(
      (timer.startedAt ? timer.countdown : initialCount) / 1000
    ),
    elapsed: Math.round(timer.elapsed / 1000),
    start: () => {
      const timer = findTimer(id) || addTimer(id);
      timer.startedAt = Date.now();
      timer.alarmAt = timer.startedAt + initialCount;
    },
    reset: () => {
      const timer = findTimer(id);
      if (timer) {
        // reset the timer
        Object.assign(timer, initialTimerValues);
        // force final update
        setCount(initialCount);
      }
    },
  };
};

export const TestTimerWidget = (props: { id: string }): React.ReactNode => {
  const { running, countdown, elapsed, reset, start } = useTestTimer(props.id);
  const mmss = (t: number) => {
    const mins = Math.floor(Math.abs(t) / 60);
    const secs = Math.abs(t) % 60;
    return `${mins}:${("0" + secs).slice(-2)}`;
  };
  if (!running) {
    return (
      <button className="timer-button timer-reset" onClick={start}>
        <span>{mmss(countdown)}</span> <FontAwesomeIcon icon={faStopwatch} />
      </button>
    );
  }
  if (countdown >= 0) {
    return (
      <button className="timer-button timer-running" onClick={reset}>
        <span>{mmss(countdown)}</span> <FontAwesomeIcon icon={faRedo} />
      </button>
    );
  }
  return (
    <div>
      <span className="timer-overtime">{mmss(elapsed)} elapsed </span>
      <button className="timer-button timer-ready" onClick={reset}>
        <span>RESULT READY</span> <FontAwesomeIcon icon={faRedo} />
      </button>
    </div>
  );
};
