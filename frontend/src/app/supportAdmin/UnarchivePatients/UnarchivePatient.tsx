import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import moment from "moment/moment";
import { useNavigate } from "react-router-dom";

import { useDocumentTitle } from "../../utils/hooks";
import { PATIENT_TERM, PATIENT_TERM_CAP } from "../../../config/constants";
import Select from "../../commonComponents/Select";
import {
  ArchivedStatus,
  useGetOrganizationWithFacilitiesLazyQuery,
  useGetPatientsByFacilityWithOrgLazyQuery,
  useGetPatientsCountByFacilityWithOrgLazyQuery,
} from "../../../generated/graphql";
import { displayFullName } from "../../utils";
import Button from "../../commonComponents/Button/Button";
import Pagination from "../../commonComponents/Pagination";
import { useSelectedFacility } from "../../facilitySelect/useSelectedFacility";

import {
  UnarchivePatientFacility,
  UnarchivePatientOrganization,
  UnarchivePatientPatient,
} from "./UnarchivePatientContainer";

interface UnarchivePatientProps {
  organizations: UnarchivePatientOrganization[] | [];
  currentPage: number;
  selectedFacilityId: string;
  setSelectedFacilityId: (facilityId: string) => void;
  selectedOrgId: string;
  setSelectedOrgId: (orgInternalId: string) => void;
  archivedPatientsCount: undefined | number;
  setArchivedPatientsCount: (count: number | undefined) => void;
  facilities: UnarchivePatientFacility[] | [];
  setFacilities: (facilities: UnarchivePatientFacility[]) => void;
  archivedPatients: UnarchivePatientPatient[] | undefined;
  setArchivedPatients: (
    patients: UnarchivePatientPatient[] | undefined
  ) => void;
}

const displayPatientTable = (
  patients: UnarchivePatientPatient[] | undefined,
  patientsCount: number | undefined
) => {
  return patients !== undefined && patientsCount !== undefined;
};

const displayPagination = (
  patients: UnarchivePatientPatient[] | undefined,
  patientsCount: number | undefined
) => {
  if (patients && patientsCount) {
    return patientsCount > 0 && patients.length > 0;
  } else {
    return false;
  }
};

const displayInstructions = (
  selectedOrgId: string,
  patients: UnarchivePatientPatient[] | undefined,
  patientsCount: number | undefined,
  facilities: UnarchivePatientFacility[]
) => {
  if (
    !displayPatientTable(patients, patientsCount) &&
    !displayNoFacilitiesMsg(selectedOrgId, facilities)
  ) {
    return (
      <div className="width-full margin-top-2">
        Filter by organization and testing facility to display archived
        patients.
      </div>
    );
  }
};

const displayNoFacilitiesMsg = (
  selectedOrgId: string,
  facilities: UnarchivePatientFacility[]
) => {
  if (selectedOrgId && facilities?.length === 0) {
    return (
      <div className="width-full margin-top-2">
        This organization has no facilities. Select a different organization.
      </div>
    );
  }
};

const getOrgExternalIdWithInternalId = (
  orgs: UnarchivePatientOrganization[],
  internalId: string
) => {
  let org = orgs.find((org) => org.internalId === internalId);
  return org?.externalId;
};
const UnarchivePatient = ({
  organizations,
  currentPage,
  selectedFacilityId,
  setSelectedFacilityId,
  selectedOrgId,
  setSelectedOrgId,
  archivedPatientsCount,
  setArchivedPatientsCount,
  facilities,
  setFacilities,
  archivedPatients,
  setArchivedPatients,
}: UnarchivePatientProps) => {
  const pageTitle = `Unarchive ${PATIENT_TERM}`;
  useDocumentTitle(pageTitle);
  const unarchivePatientPageUrl = "/admin/unarchive-patient";
  const entriesPerPage = 20;

  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);

  const [activeFacility] = useSelectedFacility();
  const navigate = useNavigate();

  const [queryGetOrgWithFacilities] = useGetOrganizationWithFacilitiesLazyQuery(
    {
      fetchPolicy: "no-cache",
    }
  );
  const [queryGetPatientsByFacilityWithOrg] =
    useGetPatientsByFacilityWithOrgLazyQuery({
      fetchPolicy: "no-cache",
    });

  const [queryGetPatientsCountByFacilityWithOrg] =
    useGetPatientsCountByFacilityWithOrgLazyQuery({
      fetchPolicy: "no-cache",
    });

  const {
    getValues,
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm({});

  const formCurrentValues = watch();

  useEffect(() => {
    fetchAndSetArchivedPatients(
      selectedOrgId,
      selectedFacilityId,
      organizations
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const onOrgChange = async (selectedOrgInternalId: string) => {
    setFacilities([]);
    setArchivedPatients(undefined);
    setArchivedPatientsCount(undefined);
    if (selectedOrgInternalId) {
      setSelectedOrgId(selectedOrgInternalId);
      let res = await queryGetOrgWithFacilities({
        variables: { id: selectedOrgInternalId },
      });
      let facilities = res.data?.organization?.facilities
        ? res.data?.organization?.facilities
        : [];
      if (facilities !== undefined && facilities.length > 0) {
        facilities.sort((a, b) => (a.name > b.name ? 1 : -1));
      }
      setFacilities(facilities);
    }
  };

  const onFacilityChange = (facilityId: string) => {
    if (facilityId === "") {
      setArchivedPatientsCount(undefined);
      setArchivedPatients(undefined);
    }
    setSelectedFacilityId(facilityId);
  };

  const fetchAndSetArchivedPatientsCount = async (
    orgInternalId: string,
    facilityId: string,
    organizations: UnarchivePatientOrganization[]
  ) => {
    if (orgInternalId && facilityId && organizations) {
      setIsLoadingCount(true);
      let orgExternalId = getOrgExternalIdWithInternalId(
        organizations,
        orgInternalId
      );
      if (orgExternalId) {
        let { data } = await queryGetPatientsCountByFacilityWithOrg({
          variables: {
            facilityId: facilityId,
            archivedStatus: ArchivedStatus.Archived,
            orgExternalId: orgExternalId,
          },
        });
        let newArchivedPatientsCount = data?.patientsCount || 0;
        setArchivedPatientsCount(newArchivedPatientsCount);
      }
      setIsLoadingCount(false);
    }
  };

  const fetchAndSetArchivedPatients = async (
    orgInternalId: string,
    facilityId: string,
    organizations: UnarchivePatientOrganization[]
  ) => {
    if (orgInternalId && facilityId && organizations) {
      setIsLoadingPatients(true);
      let orgExternalId = getOrgExternalIdWithInternalId(
        organizations,
        orgInternalId
      );
      if (orgExternalId) {
        let { data } = await queryGetPatientsByFacilityWithOrg({
          variables: {
            facilityId: facilityId,
            pageNumber: currentPage - 1,
            pageSize: entriesPerPage,
            archivedStatus: ArchivedStatus.Archived,
            orgExternalId: orgExternalId,
          },
        });
        let newArchivedPatients: any[] = data?.patients || [];
        setArchivedPatients(newArchivedPatients);
        setIsLoadingPatients(false);
      }
    }
  };

  const onSubmit = async () => {
    const values = getValues();
    let orgId = values.organization;
    let facilityId = values.facility;
    if (orgId && facilityId) {
      let searchParams = "";
      if (activeFacility?.id) {
        searchParams = `?facility=${activeFacility.id}`;
      }
      await fetchAndSetArchivedPatients(orgId, facilityId, organizations);
      await fetchAndSetArchivedPatientsCount(orgId, facilityId, organizations);
      // clear pagination on search submit
      navigate(`${unarchivePatientPageUrl}${searchParams}`);
    }
  };

  const patientRows = (
    archivedPatients: UnarchivePatientPatient[] | undefined,
    archivedPatientsCount: number | undefined
  ) => {
    if (displayPagination(archivedPatients, archivedPatientsCount)) {
      return archivedPatients?.map((patient: UnarchivePatientPatient) => {
        let fullName = displayFullName(
          patient.firstName,
          patient.middleName,
          patient.lastName
        );

        return (
          <tr key={patient.internalId} data-testid="sr-archived-patient-row">
            <td>{fullName}</td>
            <td>{moment(patient.birthDate).format("MM/DD/yyyy")}</td>
            <td>
              {patient.facility ? patient.facility.name : "All facilities"}
            </td>
            <td>
              {/*Need to update in #6064*/}
              <Button
                type="button"
                label="Unarchive"
                aria-label={`Unarchive ${fullName}`}
              />
            </td>
          </tr>
        );
      });
    } else {
      return (
        <tr>
          <td colSpan={5}>No results</td>
        </tr>
      );
    }
  };

  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div className="display-flex flex-align-center">
                <h1 className="font-sans-lg margin-y-0">{pageTitle}</h1>
                <span className="sr-showing-patients-on-page margin-left-4">
                  {isLoadingCount && "Loading..."}
                  {displayPagination(
                    archivedPatients,
                    archivedPatientsCount
                  ) && (
                    <>
                      Showing {(currentPage - 1) * entriesPerPage + 1}-
                      {Math.min(
                        entriesPerPage * currentPage,
                        archivedPatientsCount ?? 0
                      )}{" "}
                      of {archivedPatientsCount}
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className="bg-base-lightest">
              <form
                className="display-flex grid-row grid-gap flex-row flex-align-end padding-x-3 padding-y-2"
                role="search"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className={"desktop:grid-col-4 mobile:grid-col-12"}>
                  <Select
                    label="Organization"
                    name="organization"
                    value={formCurrentValues.organization}
                    defaultOption={"Select an organization"}
                    defaultSelect={true}
                    required={true}
                    options={organizations.map((o) => ({
                      label: o.name,
                      value: o.internalId,
                    }))}
                    registrationProps={register("organization", {
                      onChange: (e) => onOrgChange(e.target.value),
                      required: true,
                    })}
                    validationStatus={
                      errors?.organization?.type === "required"
                        ? "error"
                        : undefined
                    }
                    errorMessage="Organization is required"
                  />
                </div>
                <div className={"desktop:grid-col-4 mobile:grid-col-12"}>
                  <Select
                    label="Testing facility"
                    name="facilities"
                    defaultOption={"Select a testing facility"}
                    defaultSelect={true}
                    required={true}
                    value={formCurrentValues.facility}
                    options={facilities.map((o) => ({
                      label: o.name,
                      value: o.id,
                    }))}
                    registrationProps={register("facility", {
                      onChange: (e) => onFacilityChange(e.target.value),
                      required: true,
                    })}
                    validationStatus={
                      errors?.facility?.type === "required"
                        ? "error"
                        : undefined
                    }
                    errorMessage="Testing facility is required"
                  />
                </div>
                <div className={"mobile:margin-top-3"}>
                  <Button type="submit" label="Search" />
                </div>
              </form>
            </div>
            <div className="usa-card__body sr-patient-list">
              {isLoadingPatients && "Loading..."}
              {displayPatientTable(archivedPatients, archivedPatientsCount) && (
                <table className="usa-table usa-table--borderless width-full">
                  <thead>
                    <tr>
                      <th scope="col">{PATIENT_TERM_CAP}</th>
                      <th scope="col">Date of birth</th>
                      <th scope="col">Testing facility</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody aria-live="polite">
                    {patientRows(archivedPatients, archivedPatientsCount)}
                  </tbody>
                </table>
              )}
              {displayInstructions(
                formCurrentValues.organization,
                archivedPatients,
                archivedPatientsCount,
                facilities
              )}
              {displayNoFacilitiesMsg(
                formCurrentValues.organization,
                facilities
              )}
            </div>
            {displayPagination(archivedPatients, archivedPatientsCount) && (
              <div className="usa-card__footer">
                <Pagination
                  baseRoute={unarchivePatientPageUrl}
                  currentPage={currentPage}
                  entriesPerPage={entriesPerPage}
                  totalEntries={archivedPatientsCount ?? 0}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnarchivePatient;
