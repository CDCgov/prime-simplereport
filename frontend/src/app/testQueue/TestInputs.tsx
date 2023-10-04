import moment from "moment";
import React, { useState } from "react";

import TextInput from "../commonComponents/TextInput";
import { formatDate } from "../utils/date";

const TestInputs = () => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  return (
    <>
      <TextInput
        name="test-date"
        data-testid="test-date"
        type="date"
        label="Test date and time"
        aria-label="Test date"
        min={formatDate(new Date("Jan 1, 2020"))}
        max={formatDate(moment().toDate())}
        value={formatDate(moment(date).toDate())}
        onChange={(e) => {
          console.log("test-date onChange:", e.target.value);
          setDate(e.target.value);
        }}
        required={true}
      ></TextInput>
      <TextInput
        className="flex-align-self-end no-left-border"
        name="test-time"
        type="time"
        aria-label="Test time"
        data-testid="test-time"
        step="60"
        value={moment(time).format("HH:mm")}
        onChange={(e) => {
          console.log("test-date onChange:", e.target.value);
          setTime(e.target.value);
        }}
      ></TextInput>

      <div data-testid="date-display">{date}</div>
      <div data-testid="time-display">{time}</div>
    </>
  );
};

export default TestInputs;
