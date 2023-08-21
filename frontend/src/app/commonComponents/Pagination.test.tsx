import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Pagination from "./Pagination";

/*
// Cases (_n_ represents currentPage):
//  << _1_ >>
//  << 1 _2_ 3 >>
//  << _1_ 2 3 4 5 ... 71  >>
//  << 1 2 _3_ 4 5 ... 71  >>
//  << 1 ... 14 15 _16_ 17 18 ... 71 >>
//  << 1 ... 67 68 _69_ 70 71 >>
//  << 1 ... 67 68 69 70 _71_ >>
//  << 1 2 3 _4_ 5 6 ... 71 >>
*/

const defaults = {
  currentPage: 1,
  entriesPerPage: 10,
  totalEntries: 2,
  pageGroupSize: 5,
  className: undefined,
  baseRoute: "",
};

const testCases = {
  "with baseRoute": { baseRoute: "/patients" },
  "with className": { className: "unique-class-name" },
  "undefined currentPage": { currentPage: undefined },
  "2 pages": { totalEntries: 18, currentPage: 2 },
  "7 pages": { totalEntries: 61, currentPage: 4 },
  "10 pages": { entriesPerPage: 5, totalEntries: 48, currentPage: 8 },
};

describe("Pagination", () => {
  it("should render Pagination cases", () => {
    Object.entries(testCases).forEach(([name, tc], _index) => {
      const props = { ...defaults, ...tc } as any;
      const { container } = render(
        <MemoryRouter>
          <Pagination {...props} />
        </MemoryRouter>
      );
      expect(container).toMatchSnapshot(`Pagination '${name}'`);
    });
  });

  it("should handle onClick event", async () => {
    let onPaginationClick: jest.Mock = jest.fn();
    let mockProp = {
      ...defaults,
      onPaginationClick,
    };
    const props = { ...mockProp, ...testCases["with baseRoute"] } as any;
    render(
      <MemoryRouter>
        <Pagination {...props} />
      </MemoryRouter>
    );
    await act(async () => screen.getAllByText("1")[0].closest("a")?.click());
    expect(onPaginationClick).toHaveBeenCalledWith(1);
  });
});
