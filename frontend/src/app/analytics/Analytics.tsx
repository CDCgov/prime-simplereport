import { ChangeEvent, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import moment from "moment";

import { DatePicker } from "../commonComponents/DatePicker";
import Dropdown from "../commonComponents/Dropdown";
import { useGetTopLevelDashboardMetricsQuery } from "../../generated/graphql";
import { LoadingCard } from "../commonComponents/LoadingCard/LoadingCard";

import "./Analytics.scss";
import AggregateResultsTable, { ResultsRow } from "./AggregateResultsTable";

const abbeyRoad: ResultsRow = {
  name: "Abbey Road School District (Organization)",
  testsConducted: 29,
  numberPeopleTested: 25,
  positiveTests: 3,
  negativeTests: 26,
  positivityRate: 10.3,
};

const kennedyHigh: ResultsRow = {
  name: "Kennedy High School",
  testsConducted: 16,
  numberPeopleTested: 14,
  positiveTests: 1,
  negativeTests: 15,
  positivityRate: 6.25,
};

const beverlyMiddle: ResultsRow = {
  name: "Beverly Middle School",
  testsConducted: 4,
  numberPeopleTested: 3,
  positiveTests: 0,
  negativeTests: 4,
  positivityRate: 0,
};

const johnsonElementary: ResultsRow = {
  name: "Johnson Elementary",
  testsConducted: 9,
  numberPeopleTested: 9,
  positiveTests: 2,
  negativeTests: 7,
  positivityRate: 22.22,
};

const jacksonHigh: ResultsRow = {
  name: "Jackson High School",
  testsConducted: 0,
  numberPeopleTested: 0,
  positiveTests: 0,
  negativeTests: 0,
  positivityRate: 0,
};

const EXTERNAL_DATE_FORMAT = "MM/DD/YYYY";

export const Analytics = () => {
  const organization = useSelector(
    (state) => (state as any).organization as Organization
  );
  const facilities = useSelector(
    (state) => ((state as any).facilities as Facility[]) || []
  );
  const [facilityId, setFacilityId] = useState<string>("");
  const [facilityName, setFacilityName] = useState<string>(organization.name);
  const [dateRange, setDateRange] = useState<string>("week");
  const [startDate, setStartDate] = useState<string>(
    moment().subtract(1, "week").format(EXTERNAL_DATE_FORMAT)
  );
  const [endDate, setEndDate] = useState<string>(
    moment().format(EXTERNAL_DATE_FORMAT)
  );

  useEffect(() => {
    const startInput = document.getElementById("startDate") as HTMLInputElement;
    const endInput = document.getElementById("endDate") as HTMLInputElement;
    if (startInput) {
      startInput.value = startDate;
    }
    if (endInput) {
      endInput.value = endDate;
    }
  });

  const updateFacility = ({
    target: { value },
  }: ChangeEvent<HTMLSelectElement>) => {
    const facilityName =
      facilities.find((f) => f.id === value)?.name || "All facilities";
    setFacilityId(value);
    setFacilityName(facilityName);
  };

  const updateDateRange = ({
    target: { value },
  }: ChangeEvent<HTMLSelectElement>) => {
    setDateRange(value);
    switch (value) {
      case "day":
        setStartDate(moment().subtract(1, "day").format(EXTERNAL_DATE_FORMAT));
        setEndDate(moment().format(EXTERNAL_DATE_FORMAT));
        break;
      case "week":
        setStartDate(moment().subtract(7, "day").format(EXTERNAL_DATE_FORMAT));
        setEndDate(moment().format(EXTERNAL_DATE_FORMAT));
        break;
      case "month":
        setStartDate(moment().subtract(30, "day").format(EXTERNAL_DATE_FORMAT));
        setEndDate(moment().format(EXTERNAL_DATE_FORMAT));
        break;
      default:
        break;
    }
  };

  const now = moment();

  const { data, loading, error } = useGetTopLevelDashboardMetricsQuery({
    variables: {
      facilityId,
      startDate: moment(startDate, EXTERNAL_DATE_FORMAT)
        .hour(now.hours())
        .minute(now.minutes())
        .toDate(),
      endDate: moment(endDate, EXTERNAL_DATE_FORMAT)
        .hour(now.hours())
        .minute(now.minutes())
        .toDate(),
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
                    label: "All facilities",
                    value: "",
                  },
                  ...facilities.map((f) => ({
                    label: f.name,
                    value: f.id,
                  })),
                ]}
                onChange={updateFacility}
                selectedValue={facilityId}
              />
            </div>
            {/* TODO: filter by patient role */}
            <div className="grid-col-4">
              <Dropdown
                label="Date range"
                options={[
                  {
                    label: "Last day (24 hours)",
                    value: "day",
                  },
                  {
                    label: "Last week (7 days)",
                    value: "week",
                  },
                  {
                    label: "Last month (30 days)",
                    value: "month",
                  },
                  {
                    label: "Custom date range",
                    value: "custom",
                  },
                ]}
                onChange={updateDateRange}
                selectedValue={dateRange}
              />
            </div>
          </div>
          {dateRange === "custom" && (
            <div className="grid-row grid-gap margin-top-2">
              <div className="grid-col-4">
                <DatePicker
                  name="startDate"
                  label="Begin"
                  onChange={(date?: string) => {
                    if (date && date.length === 10) {
                      const newDate = moment(date, EXTERNAL_DATE_FORMAT);
                      if (newDate.isValid()) {
                        setStartDate(newDate.format(EXTERNAL_DATE_FORMAT));
                      }
                    }
                  }}
                  noHint
                />
              </div>
              <div className="grid-col-4">
                <DatePicker
                  name="endDate"
                  label="End"
                  onChange={(date?: string) => {
                    if (date && date.length === 10) {
                      const newDate = moment(date, EXTERNAL_DATE_FORMAT);
                      if (newDate.isValid()) {
                        setEndDate(newDate.format(EXTERNAL_DATE_FORMAT));
                      }
                    }
                  }}
                  noHint
                />
              </div>
            </div>
          )}
          <h3>{facilityName}</h3>
          <p className="margin-bottom-0">All roles</p>
          <p>{`${startDate} \u2013 ${endDate}`}</p>
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
