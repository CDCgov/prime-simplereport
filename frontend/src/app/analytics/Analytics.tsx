import { DatePicker } from "../commonComponents/DatePicker";
import Dropdown from "../commonComponents/Dropdown";

import "./Analytics.scss";
import testsConducted from "./img/tests-conducted-graph.png";
import positivityRate from "./img/positivity-rate-graph.png";
import positiveTests from "./img/positive-tests-map.png";
import totalsByRole from "./img/totals-by-role-table.png";
import allTestingFacilities from "./img/all-testing-facilities-table.png";
import testsConductedAllFacilities from "./img/tests-conducted-all-facilities-graph.png";

export const Analytics = () => {
  return (
    <main className="prime-home">
      <div id="analytics-page" className="grid-container">
        <h2 className="position-relative">COVID-19 testing data</h2>
        <div className="prime-container card-container padding-2">
          <div className="grid-row grid-gap">
            <div className="grid-col-3">
              <Dropdown
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
            <div className="grid-col-3">
              <Dropdown
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
            <div className="grid-col-3 inline-datepicker flex-row">
              <DatePicker
                name="begin"
                label="Begin"
                defaultValue="12/1/2021"
                noHint
              />
            </div>
            <div className="grid-col-3 inline-datepicker flex-row">
              <DatePicker
                name="end"
                label="End"
                defaultValue="12/31/2021"
                noHint
              />
            </div>
          </div>
          <h3>Abby Road School District</h3>
          <p>{`12/1/2021 \u2013 12-31/2021`}</p>
          <div className="grid-row grid-gap-6">
            <div className="grid-col-4">
              <div className="card display-flex flex-column flex-row">
                <h2 className="flex-align-self-center">Tests conducted</h2>
                <h1 className="flex-align-self-center">29</h1>
                <p className="flex-align-self-center"></p>
              </div>
            </div>
            <div className="grid-col-4">
              <div className="card display-flex flex-column flex-align-center">
                <h2>Positive tests</h2>
                <h1>3</h1>
                {/* \u2BC6 is down pointing triangle */}
                <p>
                  <span className="red-pointing-up">{`\u2BC5`}</span> 2 from
                  last week
                </p>
              </div>
            </div>
            <div className="grid-col-4">
              <div className="card display-flex flex-column flex-align-center">
                <h2>Positivity rate</h2>
                <h1>10.3%</h1>
                <p>Above average for Clayton county</p>
              </div>
            </div>
          </div>
          <div className="grid-row grid-gap margin-top-4">
            <div className="grid-col-6">
              <img src={testsConducted} alt="Tests conducted graph" />
            </div>
            <div className="grid-col-6">
              <img src={positivityRate} alt="Positivity rate graph" />
            </div>
          </div>
          <p>Positive tests</p>
          <div className="grid-row">
            <div className="grid-col-4">
              <img src={positiveTests} alt="Positive tests map" />
            </div>
            <div className="grid-col-4">
              <img src={positiveTests} alt="Positive tests map" />
            </div>
            <div className="grid-col-4">
              <img src={positiveTests} alt="Positive tests map" />
            </div>
          </div>
          <h4>Totals by role</h4>
          <img src={totalsByRole} alt="Totals by role table" />
        </div>
        <div className="padding-2">
          <h4>All testing facilities</h4>
          <img src={allTestingFacilities} alt="All testing facilities table" />
          <div className="grid-row">
            <div className="grid-col-6">
              <img
                src={testsConductedAllFacilities}
                alt="Tests conducted all facilities graph"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
