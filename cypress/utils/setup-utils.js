import {
  accessOrganization,
  addMockFacility,
  addPatient,
  createDeviceType,
  createOrganization,
  getOrganizationsByName,
  getPatientsByFacilityId,
  markOrganizationAsDeleted,
  markPatientAsDeleted,
  verifyPendingOrganization,
  deleteOktaOrgs,
  getSpecimenTypes,
} from "./testing-data-utils";
import { generateCovidOnlyDevice, generateUser } from "../support/e2e";

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

export const setupOrgFacility = (specRunVersionName) => {
  let orgName = createOrgName(specRunVersionName);
  let facilityName = createFacilityName(specRunVersionName);
  createAndVerifyOrganization(orgName)
    .then(() => getOrganizationsByName(orgName))
    .then((res) =>
      accessOrganization(res.body.data.organizationsByName[0].externalId),
    )
    .then(() => addMockFacility(facilityName));
};

export const getCurrentRunFacility = (specRunVersionName) => {
  let orgName = createOrgName(specRunVersionName);
  return getOrganizationsByName(orgName).then((res) => {
    let orgs = res.body.data.organizationsByName;
    let org = orgs.length > 0 ? orgs[0] : null;
    if (org) {
      let facilities = org.facilities;
      return facilities.length > 0 ? facilities[0] : null;
    }
  });
};

export const setupPatient = (specRunVersionName, patient) => {
  const addPatientVariables = {
    firstName: patient.firstName,
    lastName: patient.lastName,
    birthDate: patient.dobForInput,
    street: patient.address,
    city: patient.city,
    state: patient.state,
    zipCode: patient.zip,
    telephone: patient.phone,
  };
  addPatient(addPatientVariables);
};

export const setupDevices = (specRunVersionName) => {
  getSpecimenTypes().then((result) => {
    const specimenTypes = result.body.data.specimenTypes;
    const specimenTypeId =
      specimenTypes.length > 0 ? specimenTypes[0].internalId : null;
    const covidOnlyDevice = generateCovidOnlyDevice();
    const createDeviceTypeVariables = {
      name: covidOnlyDevice.name,
      manufacturer: covidOnlyDevice.manufacturer,
      model: covidOnlyDevice.model,
      swabTypes: [specimenTypeId],
      // TODO: get supported diseases
      // supportedDiseaseTestPerformed: supportedDiseaseTestPerformed,
      // testLength: testLength,
    };
    createDeviceType(createDeviceTypeVariables).then((deviceId) => {
      // TODO: add facility device type relation
    });
  });
};

export const accessOrganizationByName = (orgName) => {
  getOrganizationsByName(orgName)
    .then((res) => accessOrganization(res.body.data.organizationsByName[0].externalId))
}
