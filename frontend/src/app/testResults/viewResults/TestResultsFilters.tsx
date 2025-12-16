import { Label } from "@trussworks/react-uswds";
import React, {
  ChangeEventHandler,
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
} from "react";
import moment from "moment/moment";
import { useLazyQuery } from "@apollo/client";

import SearchInput from "../../testQueue/addToQueue/SearchInput";
import SearchResults from "../../testQueue/addToQueue/SearchResults";
import Select from "../../commonComponents/Select";
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
import { useSupportedDiseaseOptionList } from "../../utils/disease";
import { TextWithTooltip } from "../../commonComponents/TextWithTooltip";

import { ALL_FACILITIES_ID, DateRangeFilter } from "./TestResultsList";
import { getTodaysDate } from "./utils";

const getFilteredPatientName = (
  params: FilterParams,
  data: GetResultsMultiplexWithCountQuery
) => {
  const firstLoadedContentEntry =
    data?.resultsPage?.content && data?.resultsPage?.content[0];
  const person = firstLoadedContentEntry?.patient;
  if (params.patientId && person) {
    return displayFullName(
      person.firstName,
      person.middleName,
      person.lastName
    );
  }
  return null;
};

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

interface TestResultsFiltersProps {
  data: any;
  activeFacilityId: string;
  filterParams: FilterParams;
  setFilterParams: (key: keyof FilterParams) => (val: string | null) => void;
  dateRange: DateRangeFilter;
  setDateRange: Dispatch<SetStateAction<DateRangeFilter>>;
}

const TestResultsFilters: React.FC<TestResultsFiltersProps> = ({
  data,
  dateRange,
  setDateRange,
  activeFacilityId,
  filterParams,
  setFilterParams,
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
    if (event.type === "change") {
      if (event.target.value === "") {
        setFilterParams("patientId")(null);
      }
      setShowSuggestion(true);
      if (event.target.value !== queryString) {
        setDebounced(event.target.value);
      }
    }
  };

  /**
   * Date range filters
   */

  const { startDate, endDate, startDateError, endDateError } = dateRange;
  const maxDate = getTodaysDate();

  const processStartDate = (value: string | undefined) => {
    if (value) {
      if (!isValidDate(value, true)) {
        setDateRange((prevState) => ({
          ...prevState,
          startDate: "Date must be in format MM/DD/YYYY",
        }));
      } else {
        const startDate = moment(value, "YYYY-MM-DD").startOf("day");
        setDateRange((prevState) => ({
          ...prevState,
          startDate: startDate.toISOString(),
          startDateError: undefined,
        }));
      }
    } else {
      setDateRange((prevState) => ({ ...prevState, startDate: "" }));
    }
  };

  const processEndDate = (value: string | undefined) => {
    if (value) {
      if (!isValidDate(value)) {
        setDateRange((prevState) => ({
          ...prevState,
          endDateError: "Date must be in format MM/DD/YYYY",
        }));
      } else {
        const endDate = moment(value, "YYYY-MM-DD").endOf("day");
        if (
          isValidDate(filterParams.startDate || "") &&
          endDate.isBefore(moment(filterParams.startDate))
        ) {
          setDateRange((prevState) => ({
            ...prevState,
            endDateError: "End date cannot be before start date",
            endDate: "",
          }));
        } else {
          setDateRange((prevState) => ({
            ...prevState,
            endDateError: undefined,
            endDate: endDate.toISOString(),
          }));
        }
      }
    } else {
      setDateRange((prevState) => ({ ...prevState, endDate: "" }));
    }
  };

  function getDateOrEmptyString(date: string | null | undefined) {
    return date ? moment(date).format("YYYY-MM-DD") : "";
  }

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

  /**
   * Disease select
   */
  const diseaseOptions = useSupportedDiseaseOptionList();

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
        <div className="person-search padding-right-0">
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
          <Label htmlFor="start-date">
            Start date{/**/}
            <span className={"position-relative top-0125 padding-left-1"}>
              <TextWithTooltip
                tooltip={"Test results are only stored for 30 days"}
                className={"no-line-break"}
              />
            </span>
          </Label>
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
          <Label htmlFor="end-date">End date</Label>
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
          options={diseaseOptions}
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
