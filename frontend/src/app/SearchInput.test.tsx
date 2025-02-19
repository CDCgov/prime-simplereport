import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import SearchInput from "../app/testQueue/addToQueue/SearchInput";

describe("SearchInput", () => {
  const onInputChange = jest.fn();

  it("calls onSearchClick and prevents default when onSearchClick calls e.preventDefault", () => {
    const preventDefaultSpy = jest.spyOn(Event.prototype, "preventDefault");

    const onSearchClick = jest.fn((e) => {
      e.preventDefault();
    });

    render(
      <SearchInput
        onInputChange={onInputChange}
        onSearchClick={onSearchClick}
        queryString=""
        placeholder="Search..."
        showSubmitButton={true}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(onSearchClick).toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();

    preventDefaultSpy.mockRestore();
  });
});
