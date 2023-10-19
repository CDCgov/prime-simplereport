import {
  accessOrganization,
  addMockFacility,
  createOrganization,
  getOrganizationsByName, getPatientsByFacilityId,
  markOrganizationAsDeleted, markPatientAsDeleted,
  verifyPendingOrganization
} from "./testing-data-utils";
import { generateUser } from "../support/e2e";

const createOrgName = (specName) => {
  return `${specName}-org`;
}

const createFacilityName = (specName) => {
  return `${specName}-facility`;
}

const createAndVerifyOrganization = (orgName) => {
  const adminUser = generateUser();
  return createOrganization(orgName, adminUser.email)
    .then((res) => verifyPendingOrganization(res.body.orgExternalId))
}
const archivePatientsForFacility = (facilityId) => {
  return getPatientsByFacilityId(facilityId)
    .then((res) => {
      let patients = res.body.data.patients;
      if (patients.length > 0) {
        patients.map(
          (patient) => markPatientAsDeleted(patient.internalId, true))
      }
    })
}

export const cleanUpPreviousOrg = (specName) => {
  let orgName = createOrgName(specName);
  getOrganizationsByName(orgName)
    .then((res) => {
      let orgs = res.body.data.organizationsByName;
      let org = orgs.length > 1 ? orgs[0] : null;
      if (org) {
        let facilities = org.facilities
        if (facilities.length > 0) {
          facilities.map((facility) => archivePatientsForFacility(facility.id))
        }
        markOrganizationAsDeleted(org.id, true);
      }
    })
}

export const setupOrgAndFacility = (specName) => {
  let orgName = createOrgName(specName);
  let facilityName = createFacilityName(specName);
  createAndVerifyOrganization(orgName)
    .then(() => getOrganizationsByName(orgName))
    .then((res) => accessOrganization(res.body.data.organizationsByName[0].externalId))
    .then(() => addMockFacility(facilityName))
};
