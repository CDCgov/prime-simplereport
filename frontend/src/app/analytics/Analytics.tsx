import React, { ChangeEvent, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment/moment";
import classNames from "classnames";

import Dropdown from "../commonComponents/Dropdown";
import { useGetTopLevelDashboardMetricsNewQuery } from "../../generated/graphql";
import "./Analytics.scss";
import { formatDate } from "../utils/date";
import { PATIENT_TERM_PLURAL } from "../../config/constants";
import { useDocumentTitle } from "../utils/hooks";
import { MULTIPLEX_DISEASES } from "../testResults/constants";
import { useSupportedDiseaseList } from "../utils/disease";

const getDateFromDaysAgo = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

export const setStartTimeForDateRange = (date: Date): Date => {
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  return date;
};

export const setEndTimeForDateRange = (date: Date): Date => {
  date.setHours(23);
  date.setMinutes(59);
  date.setSeconds(59);
  return date;
};

export const getStartDateFromDaysAgo = (daysAgo: number): Date => {
  const newDate = getDateFromDaysAgo(daysAgo);
  return setStartTimeForDateRange(newDate);
};

export const getStartDateStringFromDaysAgo = (daysAgo: number): string => {
  const newDate = getStartDateFromDaysAgo(daysAgo);
  return newDate.toLocaleDateString();
};

export const getEndDateFromDaysAgo = (daysAgo: number): Date => {
  const newDate = getDateFromDaysAgo(daysAgo);
  return setEndTimeForDateRange(newDate);
};

export const getEndDateStringFromDaysAgo = (daysAgo: number): string => {
  const newDate = getEndDateFromDaysAgo(daysAgo);
  return newDate.toLocaleDateString();
};

interface Props {
  startDate?: string;
  endDate?: string;
}

export const Analytics = (props: Props) => {
  useDocumentTitle("Testing data dashboard");

  const organization = useSelector(
    (state) => (state as any).organization as Organization
  );
  const facilities = useSelector(
    (state) => ((state as any).facilities as Facility[]) || []
  );
  const [facilityId, setFacilityId] = useState<string>("");
  const [facilityName, setFacilityName] = useState<string>(organization.name);
  const [selectedCondition, setSelectedCondition] = useState<string>(
    MULTIPLEX_DISEASES.COVID_19
  );
  const [dateRange, setDateRange] = useState<string>("week");
  const [startDate, setStartDate] = useState<string>(
    props.startDate || getStartDateStringFromDaysAgo(7)
  );
  const [endDate, setEndDate] = useState<string>(
    props.endDate || getEndDateStringFromDaysAgo(0)
  );

  const supportedDiseaseList = useSupportedDiseaseList();

  const updateFacility = ({
    target: { value },
  }: ChangeEvent<HTMLSelectElement>) => {
    const facilityName =
      facilities.find((f) => f.id === value)?.name || "All facilities";
    setFacilityId(value);
    setFacilityName(facilityName);
  };

  const updateSelectedCondition = ({
    target: { value },
  }: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCondition(value);
  };

  const updateDateRange = ({
    target: { value },
  }: ChangeEvent<HTMLSelectElement>) => {
    setDateRange(value);
    switch (value) {
      case "day":
        setStartDate(getStartDateStringFromDaysAgo(1));
        setEndDate(getEndDateStringFromDaysAgo(0));
        break;
      case "week":
        setStartDate(getStartDateStringFromDaysAgo(7));
        setEndDate(getEndDateStringFromDaysAgo(0));
        break;
      case "month":
        setStartDate(getStartDateStringFromDaysAgo(30));
        setEndDate(getEndDateStringFromDaysAgo(0));
        break;
      default:
        break;
    }
  };

  const { data, loading, error } = useGetTopLevelDashboardMetricsNewQuery({
    variables: {
      facilityId,
      startDate:
        setStartTimeForDateRange(new Date(startDate)) ||
        getStartDateFromDaysAgo(7),
      endDate:
        setEndTimeForDateRange(new Date(endDate)) || getEndDateFromDaysAgo(0),
      disease: selectedCondition,
    },
    fetchPolicy: "no-cache",
  });

  if (error) {
    throw error;
  }

  if (!loading && data === undefined) {
    return <p>Error: Results not found</p>;
  }

  const totalTests = data?.topLevelDashboardMetrics?.totalTestCount || 0;
  const positiveTests = data?.topLevelDashboardMetrics?.positiveTestCount || 0;
  const negativeTests = totalTests - positiveTests;
  const positivityRate =
    totalTests > 0 ? (positiveTests / totalTests) * 100 : null;

  return (
    <div className="prime-home flex-1">
        <div className="grid-container">
          <div className="prime-container card-container margin-top-2">
            <div className="usa-card__header">
              <h1 className="font-sans-xl">Dashboard</h1>
            </div>
            <div id="analytics-page">
              <div className="prime-container padding-3">
                <div className="grid-row grid-gap">
                  <div className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1">
                    <Dropdown
                      label="Testing facility"
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
                  <div className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1">
                    <Dropdown
                      label="Condition"
                      options={supportedDiseaseList.map((disease: string) => {
                        return {
                          label: disease,
                          value: disease,
                        };
                      })}
                      onChange={updateSelectedCondition}
                      selectedValue={selectedCondition}
                    />
                  </div>
                  <div className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1">
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
                    <div className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1">
                      <label className={classNames("usa-label")}>Begin</label>
                      <input
                        id={"startDate"}
                        data-testid={"startDate"}
                        type={"date"}
                        max={formatDate(new Date())}
                        className={classNames("usa-input")}
                        aria-label={"Enter start date"}
                        onChange={(e) => {
                          if (Date.parse(e.target.value)) {
                            const d = moment(e.target.value).toDate();
                            const startDateString = setStartTimeForDateRange(
                              new Date(d)
                            ).toLocaleDateString();
                            setStartDate(startDateString);
                          }
                        }}
                        defaultValue={formatDate(new Date(startDate))}
                      />{" "}
                    </div>
                    <div className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1">
                      <label className={classNames("usa-label")}>End</label>
                      <input
                        id={"endDate"}
                        data-testid={"endDate"}
                        type={"date"}
                        min={formatDate(new Date(startDate))}
                        max={formatDate(new Date())}
                        className={classNames("usa-input")}
                        aria-label={"Enter end date"}
                        onChange={(e) => {
                          if (Date.parse(e.target.value)) {
                            const d = moment(e.target.value).toDate();
                            const endDateString = setEndTimeForDateRange(
                              new Date(d)
                            ).toLocaleDateString();
                            setEndDate(endDateString);
                          }
                        }}
                        defaultValue={formatDate(new Date(endDate))}
                      />
                    </div>
                  </div>
                )}
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <>
                    <h2>
                      {facilityName} - {selectedCondition} testing data
                    </h2>
                    <p className="margin-bottom-0">
                      All {PATIENT_TERM_PLURAL} tested
                    </p>
                    <p className="padding-top-1">{`${startDate} \u2013 ${endDate}`}</p>
                    <div className="grid-row grid-gap">
                      <div className="desktop:grid-col-3 tablet:grid-col-6 mobile:grid-col-1">
                        <div className="card display-flex flex-column flex-row">
                          <h3>Tests reported</h3>
                          <span className="font-sans-3xl text-bold margin-y-auto">
                            {totalTests}
                          </span>
                          <p></p>
                        </div>
                      </div>
                      <div className="desktop:grid-col-3 tablet:grid-col-6 mobile:grid-col-1">
                        <div className="card display-flex flex-column flex-align-center">
                          <h3>Positive tests</h3>
                          <span className="font-sans-3xl text-bold margin-y-auto">
                            {positiveTests}
                          </span>
                          {/* \u2BC6 is down pointing triangle */}
                          <p>
                            {/* <span className="red-pointing-up">{`\u2BC5`} 2</span>{" "}
                      <span className="usa-hint font-ui-md">from last week</span> */}
                          </p>
                        </div>
                      </div>
                      <div className="desktop:grid-col-3 tablet:grid-col-6 mobile:grid-col-1">
                        <div className="card display-flex flex-column flex-align-center">
                          <h3>Negative tests</h3>
                          <span className="font-sans-3xl text-bold margin-y-auto">
                            {negativeTests}
                          </span>
                          <p></p>
                        </div>
                      </div>
                      <div className="desktop:grid-col-3 tablet:grid-col-6 mobile:grid-col-1">
                        <div className="card display-flex flex-column flex-align-center">
                          <h3>Positivity rate</h3>
                          <span className="font-sans-3xl text-bold margin-y-auto">
                            {positivityRate !== null
                              ? positivityRate.toFixed(1) + "%"
                              : "N/A"}
                          </span>
                          <p className="font-ui-2xs">
                            Positives <span>÷</span> total tests
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};
