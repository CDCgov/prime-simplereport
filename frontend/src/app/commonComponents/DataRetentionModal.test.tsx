import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "react-modal";

import DataRetentionModal, {
  shouldShowDataRetentionModal,
} from "./DataRetentionModal";

const mockTrackEvent = jest.fn();
jest.mock("../TelemetryService", () => ({
  getAppInsights: () => ({
    trackEvent: mockTrackEvent,
  }),
}));

beforeAll(() => {
  const modalRoot = document.createElement("div");
  modalRoot.setAttribute("id", "modal-root");
  document.body.appendChild(modalRoot);
  Modal.setAppElement(modalRoot);
});

const mockWindowOpen = jest.fn();
Object.defineProperty(window, "open", {
  writable: true,
  value: mockWindowOpen,
});

describe("DataRetentionModal", () => {
  const mockOnClose = jest.fn();
  const DATA_RETENTION_MODAL_DISMISSED_KEY = "dataRetentionModalDismissed";

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("Modal rendering", () => {
    it("renders modal when isOpen is true", async () => {
      render(<DataRetentionModal isOpen={true} onClose={mockOnClose} />);

      expect(
        await screen.findByText(
          "New data retention limits are coming to SimpleReport"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(/SimpleReport only stores personal information,/)
      ).toBeInTheDocument();
      expect(screen.getByText("Learn more")).toBeInTheDocument();
      expect(screen.getByText("Continue to SimpleReport")).toBeInTheDocument();
    });

    it("does not render modal when isOpen is false", () => {
      render(<DataRetentionModal isOpen={false} onClose={mockOnClose} />);

      expect(
        screen.queryByText(
          "New data retention limits are coming to SimpleReport"
        )
      ).not.toBeInTheDocument();
    });

    it("renders checkbox with correct label", async () => {
      render(<DataRetentionModal isOpen={true} onClose={mockOnClose} />);

      expect(
        await screen.findByText("Got it. I don't need to see this again.")
      ).toBeInTheDocument();
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("renders external link icon in Learn more button", async () => {
      render(<DataRetentionModal isOpen={true} onClose={mockOnClose} />);

      const learnMoreButton = (await screen.findByText("Learn more")).closest(
        "button"
      );
      expect(learnMoreButton).toBeInTheDocument();
      expect(learnMoreButton?.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("Learn more button functionality", () => {
    it("opens external link when Learn more is clicked", async () => {
      const user = userEvent.setup();
      render(<DataRetentionModal isOpen={true} onClose={mockOnClose} />);

      const learnMoreButton = await screen.findByText("Learn more");
      await user.click(learnMoreButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        "https://www.simplereport.gov/using-simplereport/data-retention-limits/",
        "_blank",
        "noopener,noreferrer"
      );
    });

    it("tracks analytics event when Learn more is clicked", async () => {
      const user = userEvent.setup();
      render(<DataRetentionModal isOpen={true} onClose={mockOnClose} />);

      const learnMoreButton = await screen.findByText("Learn more");
      await user.click(learnMoreButton);

      expect(mockTrackEvent).toHaveBeenCalledWith({
        name: "dataRetentionModal_learnMore_clicked",
        properties: {
          action: "learn_more_clicked",
          modalType: "data_retention",
          supportLink:
            "https://www.simplereport.gov/using-simplereport/data-retention-limits/",
        },
      });
    });
  });

  describe("Continue button functionality", () => {
    it("calls onClose when Continue button is clicked", async () => {
      const user = userEvent.setup();
      render(<DataRetentionModal isOpen={true} onClose={mockOnClose} />);

      const continueButton = await screen.findByText(
        "Continue to SimpleReport"
      );
      await user.click(continueButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("does not save to localStorage when checkbox is unchecked", async () => {
      const user = userEvent.setup();
      render(<DataRetentionModal isOpen={true} onClose={mockOnClose} />);

      const continueButton = await screen.findByText(
        "Continue to SimpleReport"
      );
      await user.click(continueButton);

      expect(
        localStorage.getItem(DATA_RETENTION_MODAL_DISMISSED_KEY)
      ).toBeNull();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("saves to localStorage when checkbox is checked and Continue is clicked", async () => {
      const user = userEvent.setup();
      render(<DataRetentionModal isOpen={true} onClose={mockOnClose} />);

      const checkbox = await screen.findByRole("checkbox");
      const continueButton = await screen.findByText(
        "Continue to SimpleReport"
      );

      await user.click(checkbox);
      await user.click(continueButton);

      expect(localStorage.getItem(DATA_RETENTION_MODAL_DISMISSED_KEY)).toBe(
        "true"
      );
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});

describe("shouldShowDataRetentionModal", () => {
  const DATA_RETENTION_MODAL_DISMISSED_KEY = "dataRetentionModalDismissed";

  beforeEach(() => {
    localStorage.clear();
  });

  it("returns true when localStorage key is not set", () => {
    expect(shouldShowDataRetentionModal()).toBe(true);
  });

  it("returns false when localStorage key is set to 'true'", () => {
    localStorage.setItem(DATA_RETENTION_MODAL_DISMISSED_KEY, "true");
    expect(shouldShowDataRetentionModal()).toBe(false);
  });

  it("returns true when localStorage key is set to other values", () => {
    localStorage.setItem(DATA_RETENTION_MODAL_DISMISSED_KEY, "false");
    expect(shouldShowDataRetentionModal()).toBe(true);

    localStorage.setItem(DATA_RETENTION_MODAL_DISMISSED_KEY, "");
    expect(shouldShowDataRetentionModal()).toBe(true);
  });
});
