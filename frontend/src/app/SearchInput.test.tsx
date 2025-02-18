import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import SearchInput from "../app/testQueue/addToQueue/SearchInput";

describe("SearchInput", () => {
  const onInputChange = jest.fn();

  it("prevents form submission when disableEnterSubmit is true", () => {
    const preventDefaultSpy = jest.spyOn(Event.prototype, "preventDefault");

    render(
      <SearchInput
        onInputChange={onInputChange}
        queryString=""
        placeholder="Search..."
        disableEnterSubmit={true}
        showSubmitButton={false}
      />
    );
    const form = screen.getByRole("search");

    fireEvent.submit(form);

    expect(preventDefaultSpy).toHaveBeenCalled();

    preventDefaultSpy.mockRestore();
  });

  it("allows form submission when disableEnterSubmit is false", () => {
    render(
      <SearchInput
        onInputChange={onInputChange}
        queryString=""
        placeholder="Search..."
        disableEnterSubmit={false}
        showSubmitButton={false}
      />
    );
    const form = screen.getByRole("search");
    const submitEvent = new Event("submit", {
      bubbles: true,
      cancelable: true,
    });
    submitEvent.preventDefault = jest.fn();

    fireEvent.submit(form, submitEvent);

    // preventDefault will not be called
    expect(submitEvent.preventDefault).not.toHaveBeenCalled();
  });
});
