import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PATIENT_TERM_CAP } from "../../../config/constants";
import TEST_RESULTS_MULTIPLEX from "../mocks/resultsMultiplex.mock";
import TEST_RESULT_COVID from "../mocks/resultsCovid.mock";
import { Result } from "../../../generated/graphql";
import { toLowerCaseHyphenate } from "../../utils/text";

import ResultsTable, { generateTableHeaders } from "./ResultsTable";

const TEST_RESULTS_MULTIPLEX_CONTENT =
  TEST_RESULTS_MULTIPLEX.content as Result[];

describe("Method generateTableHeaders", () => {
  const table = (headers: JSX.Element) => (
    <table>
      <thead>{headers}</thead>
    </table>
  );
  it("checks basic headers", () => {
    render(table(generateTableHeaders(false)));
    expect(
      screen.getByRole("columnheader", {
        name: new RegExp(`${PATIENT_TERM_CAP}`, "i"),
      })
    );
    expect(
      screen.getByRole("columnheader", { name: /Test date/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Condition/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Result/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Test device/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Actions/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: /facility b/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /submitted by/i })
    ).toBeInTheDocument();
  });

  it("checks facility header", () => {
    render(table(generateTableHeaders(true)));
    expect(
      screen.getByRole("columnheader", { name: /facility/i })
    ).toBeInTheDocument();
  });

  it("checks submitted by header hides", () => {
    render(table(generateTableHeaders(true)));
    expect(
      screen.queryByRole("columnheader", {
        name: /Submitted by/i,
      })
    ).not.toBeInTheDocument();
  });
});

describe("Component ResultsTable", () => {
  const setPrintModalIdFn = jest.fn();
  const setMarkCorrectionIdFn = jest.fn();
  const setDetailsModalIdFn = jest.fn();
  const setTextModalIdFn = jest.fn();
  const setEmailModalTestResultIdFn = jest.fn();

  it("checks table without results", () => {
    render(
      <ResultsTable
        results={[]}
        setPrintModalId={setPrintModalIdFn}
        setMarkCorrectionId={setMarkCorrectionIdFn}
        setDetailsModalId={setDetailsModalIdFn}
        setTextModalId={setTextModalIdFn}
        setEmailModalTestResultId={setEmailModalTestResultIdFn}
        hasMultiplexResults={false}
        hasFacility={false}
      />
    );

    expect(
      screen.getByRole("cell", { name: /no results/i })
    ).toBeInTheDocument();
  });

  it("checks table with covid results", () => {
    render(
      <ResultsTable
        results={[TEST_RESULT_COVID.content[0] as unknown as Result]}
        setPrintModalId={setPrintModalIdFn}
        setMarkCorrectionId={setMarkCorrectionIdFn}
        setDetailsModalId={setDetailsModalIdFn}
        setTextModalId={setTextModalIdFn}
        setEmailModalTestResultId={setEmailModalTestResultIdFn}
        hasMultiplexResults={false}
        hasFacility={false}
      />
    );

    expect(screen.getByTestId("covid-19-result")).toHaveTextContent("Negative");
    expect(screen.queryByText("Flu A")).not.toBeInTheDocument();
    expect(screen.queryByText("Flu B")).not.toBeInTheDocument();
  });

  it("checks table with multiplex results", () => {
    render(
      <ResultsTable
        results={TEST_RESULTS_MULTIPLEX_CONTENT}
        setPrintModalId={setPrintModalIdFn}
        setMarkCorrectionId={setMarkCorrectionIdFn}
        setDetailsModalId={setDetailsModalIdFn}
        setTextModalId={setTextModalIdFn}
        setEmailModalTestResultId={setEmailModalTestResultIdFn}
        hasMultiplexResults={true}
        hasFacility={false}
      />
    );

    for (const result of TEST_RESULTS_MULTIPLEX_CONTENT) {
      const testId = `test-result-${result.id}-${toLowerCaseHyphenate(
        result.disease
      )}`;

      expect(screen.getByTestId(testId)).toBeInTheDocument();
    }

    expect(screen.getByTestId("filtered-results").children.length).toBe(9);
  });

  it("renders multiple results for the same patient with different aria labels", () => {
    render(
      <ResultsTable
        results={TEST_RESULTS_MULTIPLEX_CONTENT}
        setPrintModalId={setPrintModalIdFn}
        setMarkCorrectionId={setMarkCorrectionIdFn}
        setDetailsModalId={setDetailsModalIdFn}
        setTextModalId={setTextModalIdFn}
        setEmailModalTestResultId={setEmailModalTestResultIdFn}
        hasMultiplexResults={true}
        hasFacility={false}
      />
    );

    const userResults = screen.getAllByText(
      "Purrington, Rupert G"
    ) as HTMLButtonElement[];

    const userAriaLabels = userResults.map((r) => r.getAttribute("aria-label"));
    expect(new Set(userAriaLabels).size).toBe(2);
  });

  describe("actions menu", () => {
    const renderWithUser = (results: Result[]) => ({
      user: userEvent.setup(),
      ...render(
        <ResultsTable
          results={results}
          setPrintModalId={setPrintModalIdFn}
          setMarkCorrectionId={setMarkCorrectionIdFn}
          setDetailsModalId={setDetailsModalIdFn}
          setTextModalId={setTextModalIdFn}
          setEmailModalTestResultId={setEmailModalTestResultIdFn}
          hasMultiplexResults={false}
          hasFacility={false}
        />
      ),
    });

    describe("text result action", () => {
      it("includes `Text result` if patient has mobile number", async () => {
        const testResultPatientMobileNumber = [
          TEST_RESULTS_MULTIPLEX_CONTENT[4],
        ];

        const { user } = renderWithUser(testResultPatientMobileNumber);
        const moreActions = within(screen.getByRole("table")).getAllByTestId(
          "action_7c768a5d-ef90-44cd-8050-b96dd77f51d5"
        )[0];

        await user.click(moreActions);

        // Action menu is open
        expect(screen.getByText("Print result")).toBeInTheDocument();
        expect(screen.getByText("Text result")).toBeInTheDocument();
      });

      it("does not include `Text result` if no patient mobile number", async () => {
        const testResultPatientNoMobileNumber = [
          TEST_RESULTS_MULTIPLEX_CONTENT[0],
        ];

        const { user } = renderWithUser(testResultPatientNoMobileNumber);

        const moreActions = within(screen.getByRole("table")).getAllByTestId(
          "action_0969da96-b211-41cd-ba61-002181f0918d"
        )[0];

        await user.click(moreActions);

        // Action menu is open
        expect(screen.getByText("Print result")).toBeInTheDocument();
        expect(screen.queryByText("Text result")).not.toBeInTheDocument();
      });
    });

    describe("email result action", () => {
      it("includes `Email result` if patient email address", async () => {
        const testResultPatientEmail: Result[] = [
          TEST_RESULTS_MULTIPLEX_CONTENT[0],
        ];
        const { user } = renderWithUser(testResultPatientEmail);
        const moreActions = within(screen.getByRole("table")).getAllByTestId(
          "action_0969da96-b211-41cd-ba61-002181f0918d"
        )[0];

        await user.click(moreActions);

        // Action menu is open
        expect(screen.getByText("Print result")).toBeInTheDocument();
        expect(screen.getByText("Email result")).toBeInTheDocument();
      });

      it("does not include `Email result` if no patient email address", async () => {
        const testResultPatientNoEmail = [TEST_RESULTS_MULTIPLEX_CONTENT[4]];
        const { user } = renderWithUser(testResultPatientNoEmail);
        const moreActions = within(screen.getByRole("table")).getAllByTestId(
          "action_7c768a5d-ef90-44cd-8050-b96dd77f51d5"
        )[0];

        await user.click(moreActions);

        // Action menu is open
        expect(screen.getByText("Print result")).toBeInTheDocument();
        expect(screen.queryByText("Email result")).not.toBeInTheDocument();
      });
    });
  });
});
