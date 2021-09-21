import moment from "moment";

import { DatePicker } from "../commonComponents/DatePicker";
import Dropdown from "../commonComponents/Dropdown";
import { useGetTopLevelDashboardMetricsQuery } from "../../generated/graphql";
import { LoadingCard } from "../commonComponents/LoadingCard/LoadingCard";

import "./Analytics.scss";
import allTestingFacilities from "./img/all-testing-facilities-table.png";

export const Analytics = () => {
  const { data, loading, error } = useGetTopLevelDashboardMetricsQuery({
    variables: {
      facilityId: null,
      startDate: moment("2020-01-01"),
      endDate: moment("2025-01-01"),
    },
    fetchPolicy: "no-cache",
  });

  if (loading) {
    return <LoadingCard />;
  }

  if (error) {
    throw error;
  }

  if (data === undefined) {
    return <p>Error: Users not found</p>;
  }

  const totalTests = data.topLevelDashboardMetrics?.totalTestCount || 0;
  const positiveTests = data.topLevelDashboardMetrics?.positiveTestCount || 0;
  const negativeTests = totalTests - positiveTests;
  const positivityRate = (positiveTests / totalTests) * 100;

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
                <h1>{totalTests}</h1>
                <p></p>
              </div>
            </div>
            <div className="grid-col-3">
              <div className="card display-flex flex-column flex-align-center">
                <h2>Positive tests</h2>
                <h1>{positiveTests}</h1>
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
                <h1>{negativeTests}</h1>
                <p></p>
              </div>
            </div>
            <div className="grid-col-3">
              <div className="card display-flex flex-column flex-align-center">
                <h2>Positivity rate</h2>
                <h1>{positivityRate.toFixed(1)}%</h1>
                <p></p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h4>All testing facilities</h4>
          <img src={allTestingFacilities} alt="All testing facilities table" />
        </div>
      </div>
    </main>
  );
};
