import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArchivedStatus,
  useGetOrganizationsQuery,
  useGetOrganizationWithFacilitiesLazyQuery,
  useGetPatientsByFacilityWithOrgLazyQuery,
  useGetPatientsCountByFacilityWithOrgLazyQuery,
  useUnarchivePatientMutation,
} from "../../../generated/graphql";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";
import { showError, showSuccess } from "../../utils/srToast";
import { Option } from "../../commonComponents/Select";
import { useSelectedFacility } from "../../facilitySelect/useSelectedFacility";
import { useDocumentTitle } from "../../utils/hooks";
import { unarchivePatientTitle } from "../pageTitles";

import UnarchivePatientInformation from "./UnarchivePatientInformation";
import UnarchivePatientFilters from "./UnarchivePatientFilters";
import UnarchivePatientModal from "./UnarchivePatientModal";

export type UnarchivePatientOrganization = {
  internalId: string;
  externalId: string;
  name: string;
  facilities?: {
    id: string;
    name: string;
  }[];
};

export type UnarchivePatientFacility = {
  id: string;
  name: string;
};

export type UnarchivePatientPatient = {
  internalId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  isDeleted: boolean;
  facility: UnarchivePatientFacility | null;
};

export interface UnarchivePatientState {
  pageUrl: string;
  entriesPerPage: number;
  orgId: string;
  facilityId: string;
  patientsCount: number | undefined;
  patients: UnarchivePatientPatient[] | undefined;
  facilities: UnarchivePatientFacility[];
  patient: UnarchivePatientPatient | undefined;
}

export const initialState: UnarchivePatientState = {
  pageUrl: "/admin/unarchive-patient",
  entriesPerPage: 20,
  orgId: "",
  facilityId: "",
  patientsCount: undefined,
  patients: undefined,
  facilities: [],
  patient: undefined,
};

const getOrgExternalIdWithInternalId = (
  orgs: UnarchivePatientOrganization[],
  internalId: string
) => {
  let org = orgs.find((org) => org.internalId === internalId);
  return org?.externalId;
};

const UnarchivePatient = () => {
  const navigate = useNavigate();
  const [localState, updateLocalState] =
    useState<UnarchivePatientState>(initialState);
  const { pageNumber } = useParams();
  let currentPage = pageNumber ? +pageNumber : 1;
  const [activeFacility] = useSelectedFacility();

  useDocumentTitle(unarchivePatientTitle);

  const getSearchParamsStr = () => {
    if (activeFacility?.id) {
      return `?facility=${activeFacility.id}`;
    } else {
      return "";
    }
  };

  const {
    data: orgsResponse,
    loading: loadingOrgs,
    error,
  } = useGetOrganizationsQuery({
    variables: { identityVerified: true },
  });

  const [queryGetOrgWithFacilities] = useGetOrganizationWithFacilitiesLazyQuery(
    {
      fetchPolicy: "no-cache",
    }
  );

  const [queryGetPatientsByFacilityWithOrg, { loading: loadingPatients }] =
    useGetPatientsByFacilityWithOrgLazyQuery({
      fetchPolicy: "no-cache",
    });

  const [
    queryGetPatientsCountByFacilityWithOrg,
    { loading: loadingPatientsCount },
  ] = useGetPatientsCountByFacilityWithOrgLazyQuery({
    fetchPolicy: "no-cache",
  });

  const [unarchivePatientMutation] = useUnarchivePatientMutation();

  const fetchAndSetPatients = async (
    orgExternalId: string | undefined,
    pageNumber?: number
  ) => {
    if (localState.orgId && localState.facilityId && orgExternalId) {
      let pageNumberParam = pageNumber ?? currentPage;
      let { data: patientsRes } = await queryGetPatientsByFacilityWithOrg({
        variables: {
          facilityId: localState.facilityId,
          pageNumber: pageNumberParam - 1,
          pageSize: localState.entriesPerPage,
          archivedStatus: ArchivedStatus.Archived,
          orgExternalId: orgExternalId,
        },
      });
      let patients: any[] = patientsRes?.patients ? patientsRes?.patients : [];
      updateLocalState((prevState) => {
        return {
          ...prevState,
          patients: patients,
        };
      });
    }
  };

  const orgs = orgsResponse?.organizations || [];

  const orgOptions: Option<string>[] =
    orgs.map((org: UnarchivePatientOrganization) => ({
      label: org.name,
      value: org.internalId,
    })) ?? [];

  if (loadingOrgs) {
    return <LoadingCard message={"Loading Organizations"} />;
  }

  if (error) {
    showError(error.message, "Something went wrong");
  }

  const handleSelectOrganization = async (selectedOrgInternalId: string) => {
    updateLocalState(() => ({
      ...initialState,
    }));
    if (selectedOrgInternalId) {
      let { data: facilitiesRes } = await queryGetOrgWithFacilities({
        variables: { id: selectedOrgInternalId },
      });
      updateLocalState((prevState) => ({
        ...prevState,
        orgId: selectedOrgInternalId,
        facilities: facilitiesRes?.organization?.facilities || [],
      }));
    }
  };

  const handleSelectFacility = async (selectedFacilityId: string) => {
    updateLocalState((prevState) => ({
      ...prevState,
      facilityId: selectedFacilityId,
      patients: undefined,
      patientsCount: undefined,
    }));
  };

  const fetchAndSetPatientsCount = async (orgExternalId: string) => {
    if (orgExternalId) {
      let { data: patientsCountRes } =
        await queryGetPatientsCountByFacilityWithOrg({
          variables: {
            facilityId: localState.facilityId,
            archivedStatus: ArchivedStatus.Archived,
            orgExternalId: orgExternalId,
          },
        });
      let patientsCount = patientsCountRes?.patientsCount
        ? patientsCountRes?.patientsCount
        : 0;
      updateLocalState((prevState) => {
        return {
          ...prevState,
          patientsCount: patientsCount,
        };
      });
    }
  };

  const handleSearch = async () => {
    if (localState.orgId && localState.facilityId) {
      let searchParams = getSearchParamsStr();
      let orgExternalId = getOrgExternalIdWithInternalId(
        orgs,
        localState.orgId
      );
      if (orgExternalId) {
        currentPage = 1;
        await fetchAndSetPatientsCount(orgExternalId);
        await fetchAndSetPatients(orgExternalId, currentPage);
        // reset url to clear page number from pagination
        navigate(`${localState.pageUrl}${searchParams}`);
      }
    }
  };

  const handleClearFilter = () => {
    updateLocalState((prevState) => ({
      ...prevState,
      orgId: "",
      facilityId: "",
      patients: undefined,
      patientsCount: undefined,
      facilities: [],
    }));
  };

  const handlePaginationClick = async (pageNumber: number) => {
    await fetchAndSetPatients(
      getOrgExternalIdWithInternalId(orgs, localState.orgId),
      pageNumber
    );
  };

  const handleUnarchivePatient = (
    patient: UnarchivePatientPatient | undefined
  ) => {
    updateLocalState((prevState) => ({
      ...prevState,
      patient: patient,
    }));
  };

  const handleUnarchivePatientConfirmation = async (patientId: string) => {
    let orgExternalId = getOrgExternalIdWithInternalId(orgs, localState.orgId);

    if (orgExternalId) {
      try {
        await unarchivePatientMutation({
          variables: {
            id: patientId,
            orgExternalId: orgExternalId,
          },
        });

        // when un-archiving last patient on page, it sets the current page to be the previous page
        if (localState.patients?.length === 1) {
          if (currentPage > 1) {
            currentPage = currentPage - 1;
            let searchParams = getSearchParamsStr();
            navigate(`${localState.pageUrl}/${currentPage}${searchParams}`);
          }
        }
        await fetchAndSetPatients(orgExternalId, currentPage);
        await fetchAndSetPatientsCount(orgExternalId);
        showSuccess("", "Patient successfully unarchived");
      } catch (e) {
        showError(
          "Please escalate this issue to the SimpleReport team.",
          "Error unarchiving patient"
        );
      }
    }
  };

  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <UnarchivePatientFilters
          orgOptions={orgOptions}
          onSelectOrg={handleSelectOrganization}
          onSelectFacility={handleSelectFacility}
          onSearch={handleSearch}
          onClearFilter={handleClearFilter}
          loading={loadingPatients || loadingPatientsCount}
          unarchivePatientState={localState}
        />
        <UnarchivePatientInformation
          unarchivePatientState={localState}
          currentPage={currentPage}
          loading={loadingPatients || loadingPatientsCount}
          handlePaginationClick={handlePaginationClick}
          onUnarchivePatient={handleUnarchivePatient}
        />
        {localState.patient !== undefined && (
          <UnarchivePatientModal
            onClose={() => handleUnarchivePatient(undefined)}
            onUnarchivePatientConfirmation={handleUnarchivePatientConfirmation}
            patient={localState.patient}
          />
        )}
      </div>
    </div>
  );
};

export default UnarchivePatient;
