import { DatePicker } from "../commonComponents/DatePicker";
import Dropdown from "../commonComponents/Dropdown";

import "./Analytics.scss";
import AggregateResultsTable, { ResultsRow } from "./AggregateResultsTable";

let abbeyRoad: ResultsRow = {
  name: "Abbey Road School District (Organization)",
  testsConducted: 29,
  numberPeopleTested: 25,
  positiveTests: 3,
  negativeTests: 26,
  positivityRate: 10.3,
};

let kennedyHigh: ResultsRow = {
  name: "Kennedy High School",
  testsConducted: 16,
  numberPeopleTested: 14,
  positiveTests: 1,
  negativeTests: 15,
  positivityRate: 6.25,
};

let beverlyMiddle: ResultsRow = {
  name: "Beverly Middle School",
  testsConducted: 4,
  numberPeopleTested: 3,
  positiveTests: 0,
  negativeTests: 4,
  positivityRate: 0,
};

let johnsonElementary: ResultsRow = {
  name: "Johnson Elementary",
  testsConducted: 9,
  numberPeopleTested: 9,
  positiveTests: 2,
  negativeTests: 7,
  positivityRate: 22.22,
};

let jacksonHigh: ResultsRow = {
  name: "Jackson High School",
  testsConducted: 0,
  numberPeopleTested: 0,
  positiveTests: 0,
  negativeTests: 0,
  positivityRate: 0,
};

export const Analytics = () => {
  return (
    <main className="prime-home">
      <div id="analytics-page" className="grid-container">
        <h2 className="position-relative">COVID-19 testing data</h2>
        <div className="prime-container card-container padding-2">
          <div className="grid-row grid-gap">
            <div className="grid-col-4">
              <Dropdown
                label="Facility"
                options={[
                  {
                    label: "Abby Road School District",
                    value: "Abby Road School District",
                  },
                ]}
                onChange={() => {}}
                selectedValue="Abby Road School District"
              />
            </div>
            <div className="grid-col-4">
              <Dropdown
                label="Role"
                options={[
                  {
                    label: "All roles",
                    value: "All roles",
                  },
                  {
                    label: "Students",
                    value: "Students",
                  },
                  {
                    label: "Teachers",
                    value: "Teachers",
                  },
                ]}
                onChange={() => {}}
                selectedValue="All roles"
              />
            </div>
            <div className="grid-col-4">
              <Dropdown
                label="Date range"
                options={[
                  {
                    label: "Custom date range",
                    value: "Custom date range",
                  },
                ]}
                onChange={() => {}}
                selectedValue="Custom date range"
              />
            </div>
          </div>
          <div className="grid-row grid-gap margin-top-2">
            <div className="grid-col-4">
              <DatePicker
                name="begin"
                label="Begin"
                defaultValue="12/1/2021"
                noHint
              />
            </div>
            <div className="grid-col-4">
              <DatePicker
                name="end"
                label="End"
                defaultValue="12/31/2021"
                noHint
              />
            </div>
          </div>
          <h3>Abby Road School District</h3>
          <p className="margin-bottom-0">All roles</p>
          <p>{`12/1/2021 \u2013 12/31/2021`}</p>
          <div className="grid-row grid-gap">
            <div className="grid-col-3">
              <div className="card display-flex flex-column flex-row">
                <h2>Tests conducted</h2>
                <h1>29</h1>
                <p></p>
              </div>
            </div>
            <div className="grid-col-3">
              <div className="card display-flex flex-column flex-align-center">
                <h2>Positive tests</h2>
                <h1>3</h1>
                {/* \u2BC6 is down pointing triangle */}
                <p>
                  <span className="red-pointing-up">{`\u2BC5`} 2</span>{" "}
                  <span className="usa-hint font-ui-md">from last week</span>
                </p>
              </div>
            </div>
            <div className="grid-col-3">
              <div className="card display-flex flex-column flex-align-center">
                <h2>Negative tests</h2>
                <h1>26</h1>
                <p></p>
              </div>
            </div>
            <div className="grid-col-3">
              <div className="card display-flex flex-column flex-align-center">
                <h2>Positivity rate</h2>
                <h1>10.3%</h1>
                <p></p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <AggregateResultsTable
            tableName="All testing facilities"
            tableType="Facility"
            rows={[
              abbeyRoad,
              kennedyHigh,
              beverlyMiddle,
              johnsonElementary,
              jacksonHigh,
            ]}
          />
        </div>
      </div>
    </main>
  );
};
