import moment from "moment/moment";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TestInputs from "./TestInputs";

describe("TestInputs", () => {
  const dateTime = moment({
    year: 2050,
    month: 6,
    day: 15,
    hour: 12,
    minute: 35,
  });

  const renderComponent = async () => {
    const { container } = render(
      <>
        <TestInputs />
      </>
    );
    return { container, user: userEvent.setup() };
  };

  it("dateInput user.type", async () => {
    const { user } = await renderComponent();

    const dateInput = screen.getByTestId("test-date");
    await user.type(dateInput, dateTime.format("YYYY-MM-DD"));

    expect(screen.getByText("2050-07-15")).toBeInTheDocument();
  });

  it("dateInput fireEvent fireEvent.change", async () => {
    await renderComponent();

    const dateInput = screen.getByTestId("test-date");
    fireEvent.change(dateInput, {
      target: { value: dateTime.format("YYYY-MM-DD") },
    });

    expect(screen.getByText("2050-07-15")).toBeInTheDocument();
  });

  it("timeInput user.type", async () => {
    const { user } = await renderComponent();

    const timeInput = screen.getByTestId("test-time");

    // this triggers the onchange twice,
    // one with input value of 12:03, then an empty string
    await user.clear(timeInput);
    await user.type(timeInput, dateTime.format("HH:mm"));

    expect(screen.getByText("12:35")).toBeInTheDocument();
  });

  it("timeInput fireEvent.change", async () => {
    await renderComponent();

    const timeInput = screen.getByTestId("test-time");
    fireEvent.change(timeInput, {
      target: { value: dateTime.format("HH:mm") },
    });

    expect(screen.getByText("12:35")).toBeInTheDocument();
  });
});
