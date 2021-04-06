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

// Starting timer value in milliseconds
// const initialTimerCount = 15 * 60 * 1000;

// Timer list
const timers: Timer[] = [];

// Initialized timer values, id is always created unique
const initialTimerValues: Omit<Timer, "id"> = {
  alarmAt: 0,
  startedAt: 0,
  countdown: (15 * 60 * 1000),
  elapsed: 0,
  alarmed: false,
} as const;

// React-scripts 4.x (or a dependency) changed the way `require`
// returns the name of the file. New: a `Module` with a `default`
// string having the file name; Old: the actual file name.
const alarmModule = require("./test-timer.mp3");

const alarmSound = new Audio(alarmModule.default || alarmModule);

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
  });
};

const saveTimers = () => {
  localStorage.setItem("timers", JSON.stringify(timers));
};

// On load, retrieve timers from localStorage and prune them;
// only keep running timers that aren't super stale.
// Then start the timer tick.
{
  // Stale timer value (from alarm time) in milliseconds
  const staleTimerCount = 60 * 60 * 1000;

  let oldTimers: Timer[] = [];
  try {
    const storage = localStorage.getItem("timers") || "[]";
    const cutoff = Date.now() - staleTimerCount;
    oldTimers = JSON.parse(storage).filter((t: Timer) => t.alarmAt > cutoff);
  } catch (e) {}
  timers.push(...oldTimers);
  saveTimers();
  window.setInterval(timerTick, 1000);
}

const findTimer = (id: TimerId): Timer | undefined =>
  timers.find((t) => t.id === id);

const addTimer = (id: TimerId, initialCountdown: number ): Timer => {
  const newTimer = {
    id: id,
    alarmAt: 0,
    startedAt: 0,
    countdown: initialCountdown,
    elapsed: 0,
    alarmed: false,
  }
  // const newTimer = { id, ...initialTimerValues };
  timers.push(newTimer);
  saveTimers();
  return newTimer;
};
export const removeTimer = (id: TimerId) => {
  const index = timers.findIndex((t) => t.id === id);
  if (index >= 0) {
    timers.splice(index, 1);
    saveTimers();
  }
};

// need to add a new updateTimer method here that checks to see if the timer's been initialized,
// takes in the new countdown, sees how much time has elapsed, and updates the count appropriately

export const updateTimer = (id: string, initialCountdown: number) => {
  useTestTimer(id, initialCountdown);
}

export const useTestTimer = (id: string, initialCountdown: number) => {
  const [, setCount] = useState(0);
  let timer = findTimer(id) || addTimer(id, initialCountdown);
  useEffect(() => {
    timer.notify = setCount;
    return () => {
      timer.notify = undefined;
    };
  }, [id, timer]);
  let initialTimerCount = initialCountdown * 60 * 1000;
  return {
    running: timer.startedAt !== 0,
    countdown: Math.round(
      (timer.startedAt ? timer.countdown : initialTimerCount) / 1000
    ),
    elapsed: Math.round(timer.elapsed / 1000),
    start: () => {
      const timer = findTimer(id) || addTimer(id, initialCountdown);
      timer.startedAt = Date.now();
      timer.alarmAt = timer.startedAt + initialTimerCount;
      saveTimers();
    },
    reset: () => {
      const timer = findTimer(id);
      if (timer) {
        // reset the timer
        Object.assign(timer, initialTimerValues);
        // force final update
        setCount(initialTimerCount);
        saveTimers();
      }
    },
  };
};

type Props = {
  timer: ReturnType<typeof useTestTimer>;
};

export const TestTimerWidget = ({ timer }: Props) => {
  const { running, countdown, elapsed, reset, start } = timer;
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
      <button className="timer-button timer-ready" onClick={reset}>
        <span className="result-ready">RESULT READY</span>{" "}
        <span className="timer-overtime">{mmss(elapsed)} elapsed </span>{" "}
        <FontAwesomeIcon icon={faRedo} />
      </button>
    </div>
  );
};
