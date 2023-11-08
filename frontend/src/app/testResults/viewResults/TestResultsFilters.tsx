import { Label } from "@trussworks/react-uswds";
import React, { ChangeEventHandler, useEffect, useMemo } from "react";
import moment from "moment/moment";
import { useLazyQuery } from "@apollo/client";

import SearchInput from "../../testQueue/addToQueue/SearchInput";
import SearchResults from "../../testQueue/addToQueue/SearchResults";
import Select from "../../commonComponents/Select";
import { MULTIPLEX_DISEASES } from "../constants";
import {
  COVID_RESULTS,
  ROLE_VALUES,
  TEST_RESULT_DESCRIPTIONS,
} from "../../constants";
import { appPermissions, hasPermission } from "../../permissions";
import { useAppSelector } from "../../store";
import { Patient } from "../../patients/ManagePatients";
import { displayFullName, facilityDisplayName } from "../../utils";
import { isValidDate } from "../../utils/date";
import {
  ArchivedStatus,
  GetResultsMultiplexWithCountQuery,
  useGetAllFacilitiesQuery,
} from "../../../generated/graphql";
import { QUERY_PATIENT } from "../../testQueue/addToQueue/AddToQueueSearch";
import {
  useDebounce,
  useDebouncedEffect,
} from "../../testQueue/addToQueue/useDebounce";
import {
  MIN_SEARCH_CHARACTER_COUNT,
  SEARCH_DEBOUNCE_TIME,
} from "../../testQueue/constants";
import useComponentVisible from "../../commonComponents/ComponentVisible";

import { ALL_FACILITIES_ID } from "./TestResultsList";

const getFilteredPatientName = (
  params: FilterParams,
  data: GetResultsMultiplexWithCountQuery
) => {
  const firstLoadedContentEntry =
    data?.resultsPage?.content && data?.resultsPage?.content[0];
  const person = firstLoadedContentEntry && firstLoadedContentEntry.patient;
  if (params.patientId && person) {
    return displayFullName(
      person.firstName,
      person.middleName,
      person.lastName
    );
  }
  return null;
};
interface TestResultsFiltersProps {
  data: any;
  activeFacilityId: string;
  filterParams: any;
  setFilterParams: Function;
  startDate: any;
  endDate: any;
  startDateError: any;
  endDateError: any;
  setStartDate: Function;
  setEndDate: Function;
  setEndDateError: any;
  setStartDateError: any;
}
const TestResultsFilters: React.FC<TestResultsFiltersProps> = ({
  data,
  startDate,
  endDate,
  startDateError,
  endDateError,
  setStartDate,
  setEndDate,
  activeFacilityId,
  filterParams,
  setFilterParams,
  setStartDateError,
  setEndDateError,
}) => {
  const isOrgAdmin = hasPermission(
    useAppSelector((state) => state.user.permissions),
    appPermissions.settings.canView
  );

  /**
   * Patient search
   */
  const {
    ref: dropDownRef,
    isComponentVisible: showSuggestion,
    setIsComponentVisible: setShowSuggestion,
  } = useComponentVisible(true);

  const [queryString, debounced, setDebounced] = useDebounce("", {
    debounceTime: SEARCH_DEBOUNCE_TIME,
    runIf: (q) => q.length >= MIN_SEARCH_CHARACTER_COUNT,
  });

  const allowPatientsQuery = debounced.length >= MIN_SEARCH_CHARACTER_COUNT;

  useEffect(() => {
    if (!filterParams.patientId) {
      setDebounced("");
    }
  }, [filterParams, setDebounced]);

  const [queryPatients, { data: patientData, loading: patientLoading }] =
    useLazyQuery(QUERY_PATIENT, {
      fetchPolicy: "no-cache",
      variables: {
        archivedStatus: isOrgAdmin
          ? ArchivedStatus.All
          : ArchivedStatus.Unarchived,
        facilityId:
          filterParams.filterFacilityId === ALL_FACILITIES_ID
            ? null
            : filterParams.filterFacilityId || activeFacilityId,
        namePrefixMatch: queryString,
        includeArchivedFacilities: isOrgAdmin,
      },
    });

  useEffect(() => {
    if (queryString.trim() !== "") {
      queryPatients();
    }
  }, [queryString, queryPatients]);

  const onPatientSelect = (patient: Patient) => {
    setFilterParams("patientId")(patient.internalId);
    setDebounced(
      displayFullName(patient.firstName, patient.middleName, patient.lastName)
    );
    setShowSuggestion(false);
  };

  const showPatientListDropdown = useMemo(
    () => allowPatientsQuery && showSuggestion,
    [allowPatientsQuery, showSuggestion]
  );

  const canAddPatient = hasPermission(
    useAppSelector((state) => state.user.permissions),
    appPermissions.people.canEdit
  );

  const handlePatientInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.target.value === "") {
      setFilterParams("patientId")(null);
    }
    setShowSuggestion(true);
    if (event.target.value !== queryString) {
      setDebounced(event.target.value);
    }
  };

  /**
   * Date range filters
   */
  const maxDate = moment().format("YYYY-MM-DD");

  const processStartDate = (value: string | undefined) => {
    if (value) {
      if (!isValidDate(value, true)) {
        setStartDateError("Date must be in format MM/DD/YYYY");
      } else {
        const startDate = moment(value, "YYYY-MM-DD").startOf("day");
        setStartDateError(undefined);
        setStartDate(startDate.toISOString());
      }
    } else {
      setStartDate("");
    }
  };

  const processEndDate = (value: string | undefined) => {
    if (value) {
      if (!isValidDate(value)) {
        setEndDateError("Date must be in format MM/DD/YYYY");
      } else {
        const endDate = moment(value, "YYYY-MM-DD").endOf("day");
        if (
          isValidDate(filterParams.startDate || "") &&
          endDate.isBefore(moment(filterParams.startDate))
        ) {
          setEndDateError("End date cannot be before start date");
          setEndDate("");
        } else {
          setEndDateError(undefined);
          setEndDate(endDate.toISOString());
        }
      }
    } else {
      setEndDate("");
    }
  };

  function getDateOrEmptyString(date: string | null | undefined) {
    return date ? moment(date).format("YYYY-MM-DD") : "";
  }

  const DateErrorMessage: React.FC<{ message: string | undefined }> = ({
    message,
  }) => {
    if (message) {
      return (
        <span className="usa-error-message" role="alert">
          <span className="usa-sr-only">Error: </span>
          {message}
        </span>
      );
    }
    return null;
  };

  /**
   * Facility select
   */
  const { data: facilitiesData } = useGetAllFacilitiesQuery({
    fetchPolicy: "no-cache",
    variables: {
      showArchived: isOrgAdmin,
    },
  });

  const viewableFacilities: any[] = (facilitiesData?.facilities || []).filter(
    (e) => e != null
  );

  viewableFacilities.sort((a, b) => {
    if (a.isDeleted && !b.isDeleted) return 1;
    if (!a.isDeleted && b.isDeleted) return -1;
    return 0;
  });

  const facilityOptions = (
    isOrgAdmin
      ? [
          {
            label: "All facilities",
            value: ALL_FACILITIES_ID,
          },
        ]
      : []
  ).concat(
    viewableFacilities.map((f) => ({
      label: facilityDisplayName(f.name, !!f.isDeleted),
      value: f.id,
    }))
  );

  useEffect(() => {
    if (data) {
      const patientName = getFilteredPatientName(filterParams, data);
      if (patientName) {
        setDebounced(patientName);
        setShowSuggestion(false);
      }
    }
  }, [filterParams, data, setDebounced, setShowSuggestion]);

  useDebouncedEffect(
    () => {
      if (startDate !== "0") {
        setFilterParams("startDate")(startDate);
      }
    },
    [startDate],
    SEARCH_DEBOUNCE_TIME
  );
  useDebouncedEffect(
    () => {
      if (endDate !== "0") {
        setFilterParams("endDate")(endDate);
      }
    },
    [endDate],
    SEARCH_DEBOUNCE_TIME
  );

  // Todo check if we can set the building and the affecting of the url (navigation) here as it triggers because the filters change

  /**
   * HTML
   */
  return (
    <div
      id="test-results-search-by-patient-input"
      className="position-relative bg-base-lightest"
      role="search"
    >
      <div className="display-flex grid-row grid-gap flex-row flex-align-end padding-x-3 padding-y-2">
        <div className="person-search">
          <SearchInput
            onSearchClick={(e) => e.preventDefault()}
            onInputChange={handlePatientInputChange}
            queryString={debounced}
            disabled={!allowPatientsQuery}
            label={"Search by name"}
            className="usa-form-group search-input_without_submit_button"
            showSubmitButton={false}
          />
          <SearchResults
            page="test-results"
            patients={patientData?.patients || []}
            onPatientSelect={onPatientSelect}
            shouldShowSuggestions={showPatientListDropdown}
            loading={debounced !== queryString || patientLoading}
            dropDownRef={dropDownRef}
            canAddPatient={canAddPatient}
          />
        </div>
        <div className="usa-form-group date-filter-group">
          <Label htmlFor="start-date">Date range (start)</Label>
          <DateErrorMessage message={startDateError} />
          <input
            id="start-date"
            type="date"
            className="usa-input"
            min="2000-01-01"
            max={maxDate}
            onChange={(e) => processStartDate(e.target.value)}
            defaultValue={getDateOrEmptyString(filterParams.startDate)}
          />
        </div>
        <div className="usa-form-group date-filter-group">
          <Label htmlFor="end-date">Date range (end)</Label>
          <DateErrorMessage message={endDateError} />
          <input
            id="end-date"
            type="date"
            className="usa-input"
            min="2000-01-01"
            max={maxDate}
            onChange={(e) => processEndDate(e.target.value)}
            defaultValue={getDateOrEmptyString(filterParams.endDate)}
          />
        </div>
        <Select
          label="Condition"
          name="disease"
          value={filterParams.disease ?? ""}
          options={[
            {
              value: MULTIPLEX_DISEASES.COVID_19,
              label: MULTIPLEX_DISEASES.COVID_19,
            },
            {
              value: MULTIPLEX_DISEASES.FLU_A,
              label: MULTIPLEX_DISEASES.FLU_A,
            },
            {
              value: MULTIPLEX_DISEASES.FLU_B,
              label: MULTIPLEX_DISEASES.FLU_B,
            },
          ]}
          defaultSelect
          onChange={setFilterParams("disease")}
        />
        <Select
          label="Test result"
          name="result"
          value={filterParams.result || ""}
          options={[
            {
              value: COVID_RESULTS.POSITIVE,
              label: TEST_RESULT_DESCRIPTIONS.POSITIVE,
            },
            {
              value: COVID_RESULTS.NEGATIVE,
              label: TEST_RESULT_DESCRIPTIONS.NEGATIVE,
            },
            {
              value: COVID_RESULTS.INCONCLUSIVE,
              label: TEST_RESULT_DESCRIPTIONS.UNDETERMINED,
            },
          ]}
          defaultSelect
          onChange={setFilterParams("result")}
        />
        <Select
          label="Role"
          name="role"
          value={filterParams.role || ""}
          options={ROLE_VALUES}
          defaultSelect
          onChange={setFilterParams("role")}
        />
        {facilityOptions?.length > 1 ? (
          <Select
            label="Testing facility"
            name="facility"
            value={filterParams.filterFacilityId || activeFacilityId}
            options={facilityOptions}
            onChange={setFilterParams("filterFacilityId")}
            selectClassName={"usa-select-narrow"}
          />
        ) : null}
      </div>
    </div>
  );
};

export default TestResultsFilters;
