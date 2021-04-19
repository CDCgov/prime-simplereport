import { Timer } from "./TestTimer";

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

function testCountdown(actualMillis: number, mins: number, secs: number) {
  const actualMins = Math.floor(Math.abs(actualMillis) / (60 * 1000));
  const actualSecs = (Math.abs(actualMillis) % (60 * 1000)) / 1000;
  expect(actualMins).toBe(mins);
  expect(actualSecs).toBe(secs);
}
