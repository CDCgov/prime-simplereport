import {
  accessOrganization,
  addMockFacility,
  createOrganization,
  getOrganizationsByName,
  getPatientsByFacilityId,
  markOrganizationAsDeleted,
  markPatientAsDeleted,
  verifyPendingOrganization,
  deleteOktaOrgs,
  getDeviceTypes,
  addDeviceToFacility,
} from "./testing-data-utils";
import { generateUser } from "../support/e2e";

export const createOrgName = (specRunVersionName) => {
  return `${specRunVersionName}-org`;
};

export const createFacilityName = (specRunVersionName) => {
  return `${specRunVersionName}-facility`;
};

const createAndVerifyOrganization = (orgName) => {
  const adminUser = generateUser();
  return createOrganization(orgName, adminUser.email).then((res) =>
    verifyPendingOrganization(res.body.orgExternalId),
  );
};
const archivePatientsForFacility = (facilityId) => {
  return getPatientsByFacilityId(facilityId).then((res) => {
    let patients = res.body.data.patients;
    if (patients.length > 0) {
      patients.map((patient) => markPatientAsDeleted(patient.internalId, true));
    }
  });
};

export const cleanUpPreviousRunSetupData = (specRunVersionName) => {
  let orgName = createOrgName(specRunVersionName);
  getOrganizationsByName(orgName).then((res) => {
    let orgs = res.body.data.organizationsByName;
    let org = orgs.length > 0 ? orgs[0] : null;
    if (org) {
      let facilities = org.facilities;
      if (facilities.length > 0) {
        facilities.map((facility) => archivePatientsForFacility(facility.id));
      }
      markOrganizationAsDeleted(org.id, true);
    }
  });
};

export const cleanUpRunOktaOrgs = (specRunVersionName, isDeleted) => {
  let orgName = createOrgName(specRunVersionName);
  getOrganizationsByName(orgName, isDeleted).then((res) => {
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
    .then((res) =>
      accessOrganization(res.body.data.organizationsByName[0].externalId),
    )
    .then(() => addMockFacility(facilityName))
    .then(() => {
      addDevicesToCreatedFacility(specRunVersionName);
    });
};

export const getCreatedFacility = (specRunVersionName) => {
  let orgName = createOrgName(specRunVersionName);
  return getOrganizationsByName(orgName).then((res) => {
    let orgs = res.body.data.organizationsByName;
    const facility = orgs[0].facilities[0];
    return facility;
  });
};

export const addDevicesToCreatedFacility = (specRunVersionName) => {
  let orgName = createOrgName(specRunVersionName);
  getDeviceTypes()
    .then((res) => {
      const devices = res.body.data.deviceTypes;
      return devices.map((d) => d.internalId);
    })
    .then((deviceIds) => {
      getOrganizationsByName(orgName).then((res) => {
        let orgs = res.body.data.organizationsByName;
        const facility = orgs[0].facilities[0];
        addDeviceToFacility(facility, deviceIds);
      });
    });
};
