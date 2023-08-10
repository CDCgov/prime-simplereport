import React, { useState } from "react";
import { useParams } from "react-router-dom";

import { useGetOrganizationsQuery } from "../../../generated/graphql";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";
import { showError } from "../../utils/srToast";

import UnarchivePatients from "./UnarchivePatient";

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

const getSortedOrgs = (orgs: UnarchivePatientOrganization[] | undefined) => {
  return orgs ? orgs.sort((a, b) => (a.name > b.name ? 1 : -1)) : [];
};

const UnarchivePatientContainer = () => {
  const { pageNumber } = useParams();
  const currentPage = pageNumber ? +pageNumber : 1;

  const { data, loading, error } = useGetOrganizationsQuery({
    fetchPolicy: "no-cache",
    variables: { identityVerified: true },
  });
  const sortedOrgs = getSortedOrgs(data?.organizations);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");
  const [archivedPatientsCount, setArchivedPatientsCount] = useState<
    number | undefined
  >(undefined);
  const [archivedPatients, setArchivedPatients] = useState<
    UnarchivePatientPatient[] | undefined
  >(undefined);
  const [facilities, setFacilities] = useState<UnarchivePatientFacility[]>([]);

  if (loading) {
    return <LoadingCard message={"Loading Organizations"} />;
  }
  if (error) {
    showError(error.message, "Something went wrong");
  }

  return (
    <UnarchivePatients
      organizations={sortedOrgs}
      currentPage={currentPage}
      selectedFacilityId={selectedFacilityId}
      setSelectedFacilityId={setSelectedFacilityId}
      selectedOrgId={selectedOrgId}
      setSelectedOrgId={setSelectedOrgId}
      archivedPatients={archivedPatients}
      setArchivedPatients={setArchivedPatients}
      archivedPatientsCount={archivedPatientsCount}
      setArchivedPatientsCount={setArchivedPatientsCount}
      facilities={facilities}
      setFacilities={setFacilities}
    />
  );
};

export default UnarchivePatientContainer;
