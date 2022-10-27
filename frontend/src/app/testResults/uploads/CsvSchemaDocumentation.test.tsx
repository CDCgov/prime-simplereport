import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";

import { getAppInsights } from "../../TelemetryService";

import CsvSchemaDocumentation, {
  CsvSchemaDocumentationItem,
  CsvSchemaItem,
} from "./CsvSchemaDocumentation";

jest.mock("../../TelemetryService", () => ({
  ...jest.requireActual("../../TelemetryService"),
  getAppInsights: jest.fn(),
}));

const baseItem: CsvSchemaItem = {
  name: "Sample Item",
  colHeader: "sample_item",
  required: false,
  requested: false,
  acceptedValues: [],
  description: [],
  subHeader: [],
};

describe("CsvSchemaDocumentation tests", () => {
  describe("CsvSchemaDocumentationItem", () => {
    it("renders a schema item", () => {
      const { container } = render(
        <CsvSchemaDocumentationItem item={baseItem} />
      );

      const header = screen.getByTestId("header");
      expect(within(header).getByText("Sample Item")).toBeInTheDocument();

      const colHeader = screen.getByTestId("column-header");
      expect(within(colHeader).getByText("Column header")).toBeInTheDocument();
      expect(within(colHeader).getByText("sample_item")).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot();
    });

    it("renders a required schema item", () => {
      const item = {
        ...baseItem,
        required: true,
      };
      render(<CsvSchemaDocumentationItem item={item} />);
      expect(screen.getByText("Required")).toBeInTheDocument();
    });

    it("renders a optional schema item", () => {
      const item = {
        ...baseItem,
        required: false,
      };
      render(<CsvSchemaDocumentationItem item={item} />);
      expect(screen.getByText("Optional")).toBeInTheDocument();
    });

    it("renders a requested schema item", () => {
      const item = {
        ...baseItem,
        requested: true,
      };
      render(<CsvSchemaDocumentationItem item={item} />);
      expect(screen.queryByText("Required")).not.toBeInTheDocument();
      expect(screen.queryByText("Optional")).not.toBeInTheDocument();
      const header = screen.getByTestId("header");
      expect(within(header).getByText("Requested")).toBeInTheDocument();
    });

    it("renders a schema item with description", () => {
      const item = {
        ...baseItem,
        description: ["foo", "bar"],
      };
      render(<CsvSchemaDocumentationItem item={item} />);
      const description = screen.getByTestId("description");
      expect(within(description).getByText("Description")).toBeInTheDocument();
      expect(within(description).getByText("foo")).toBeInTheDocument();
      expect(within(description).getByText("bar")).toBeInTheDocument();
    });

    it("renders a schema item with accepted values", () => {
      const item = {
        ...baseItem,
        acceptedValues: ["123", "456"],
      };
      render(<CsvSchemaDocumentationItem item={item} />);
      const acceptedValues = screen.getByTestId("accepted-values");
      expect(
        within(acceptedValues).getByText("Accepted values")
      ).toBeInTheDocument();
      expect(within(acceptedValues).getByText("123")).toBeInTheDocument();
      expect(within(acceptedValues).getByText("456")).toBeInTheDocument();
    });

    it("renders a schema item with format", () => {
      const item = {
        ...baseItem,
        format: "ababa",
      };
      render(<CsvSchemaDocumentationItem item={item} />);
      const format = screen.getByTestId("format");
      expect(within(format).getByText("Format")).toBeInTheDocument();
      expect(within(format).getByText("ababa")).toBeInTheDocument();
    });

    it("renders a schema item with one example", () => {
      const item = {
        ...baseItem,
        examples: ["55555"],
      };
      render(<CsvSchemaDocumentationItem item={item} />);
      const example = screen.getByTestId("examples");
      expect(within(example).getByText("Example")).toBeInTheDocument();
      expect(within(example).getByText("55555")).toBeInTheDocument();
    });

    it("renders a schema item with multiple examples", () => {
      const item = {
        ...baseItem,
        examples: ["111", "222"],
      };
      render(<CsvSchemaDocumentationItem item={item} />);
      const examples = screen.getByTestId("examples");
      expect(within(examples).getByText("Examples")).toBeInTheDocument();
      expect(within(examples).getByText("111")).toBeInTheDocument();
      expect(within(examples).getByText("222")).toBeInTheDocument();
    });
  });

  describe("CsvSchemaDocumentaton", () => {
    it("matches snapshot", () => {
      const { container } = render(
        <MemoryRouter>
          <CsvSchemaDocumentation />
        </MemoryRouter>
      );

      expect(container).toMatchSnapshot();
    });
    it("logs to App Insights on template download", () => {
      const mockTrackEvent = jest.fn();
      (getAppInsights as jest.Mock).mockImplementation(() => {
        const ai = Object.create(ApplicationInsights.prototype);
        return Object.assign(ai, { trackEvent: mockTrackEvent });
      });
      render(
        <MemoryRouter>
          <CsvSchemaDocumentation />
        </MemoryRouter>
      );

      const templateLink1 = screen.getByRole("link", {
        name: "SimpleReport spreadsheet template with example data",
      });
      const templateLink2 = screen.getByRole("link", {
        name: "spreadsheet template",
      });
      userEvent.click(templateLink1);
      userEvent.click(templateLink2);

      expect(mockTrackEvent).toHaveBeenCalledTimes(2);
      expect(mockTrackEvent).toHaveBeenNthCalledWith(1, {
        name: "Download spreadsheet template",
      });
      expect(mockTrackEvent).toHaveBeenNthCalledWith(2, {
        name: "Download spreadsheet template",
      });
    });
  });
});
