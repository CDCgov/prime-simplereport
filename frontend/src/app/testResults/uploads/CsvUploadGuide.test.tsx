import { render } from "@testing-library/react";

import CsvUploadGuide from "./CsvUploadGuide";

describe("CsvUploadGuide", () => {
  it("renders the upload guide", () => {
    const { container } = render(<CsvUploadGuide />);
    expect(container).toMatchSnapshot();
  });
});
