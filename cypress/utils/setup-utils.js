import {
  accessOrganization,
  addMockFacility,
  createOrganization,
  deleteOktaOrgs,
} from "./testing-data-utils";
import { generateUser } from "../support/e2e";

const createOrgName = (specRunVersionName) => {
  return `${specRunVersionName}-org`;
}

const createFacilityName = (specRunVersionName) => {
  return `${specRunVersionName}-facility`;
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

export const cleanUpPreviousRunSetupData = (specRunVersionName) => {
  let orgName = createOrgName(specRunVersionName);
export const cleanUpRunOktaOrgs = (specRunVersionName) => {
  let orgName = createOrgName(specRunVersionName);

  // clean up the okta orgs corresponding to both deleted and not deleted 
  // orgs
  getOrganizationsByName(orgName, true).then((res) => {
    let orgs = res.body.data.organizationsByName;
    let org = orgs.length > 0 ? orgs[0] : null;
    if (org) {
      deleteOktaOrgs(org.externalId);
    }
  });
  getOrganizationsByName(orgName).then((res) => {
    let orgs = res.body.data.organizationsByName;
    let org = orgs.length > 0 ? orgs[0] : null;
    if (org) {
      deleteOktaOrgs(org.externalId);
    }
  });
};

export const setupRunData = (specRunVersionName) => {
  let orgName = createOrgName(specRunVersionName);
  let facilityName = createFacilityName(specRunVersionName);
  createAndVerifyOrganization(orgName)
    .then(() => getOrganizationsByName(orgName))
    .then((res) => accessOrganization(res.body.data.organizationsByName[0].externalId))
    .then(() => addMockFacility(facilityName))
};
