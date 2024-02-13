import {
  accessOrganization,
  addMockFacility,
  createOrganization,
  deleteOktaOrgs,
  getOrganizationsByName,
  verifyPendingOrganization,
  getPatientsByFacilityId,
  markPatientAsDeleted,
  markOrganizationAsDeleted,
  createDeviceType,
  getSupportedDiseases,
  getSpecimenTypes,
  addPatient,
  submitQueueItem,
  addPatientToQueue,
  addDeviceToFacility,
} from "./testing-data-utils";
import { generateUser } from "../support/e2e";

const createOrgName = (specRunVersionName) => {
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

export const cleanUpRunOktaOrgs = (specRunVersionName) => {
  let orgName = createOrgName(specRunVersionName);

  // clean up the okta orgs corresponding to both deleted and not deleted
  // orgs so that the order of app vs okta deletion doesn't matter
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
  return createAndVerifyOrganization(orgName)
    .then(() => getOrganizationsByName(orgName))
    .then((res) =>
      accessOrganization(res.body.data.organizationsByName[0].externalId),
    )
    .then(() => addMockFacility(facilityName));
};

export const getCreatedFacility = (specRunVersionName) => {
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
  return getCreatedFacility(specRunVersionName).then((facility) => {
    const addPatientVariables = {
      facilityId: facility.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      birthDate: patient.dobForInput,
      street: patient.address,
      city: patient.city,
      state: patient.state,
      country: "USA",
      zipCode: patient.zip,
      telephone: patient.phone,
    };
    return addPatient(addPatientVariables).then((result) => {
      return result.body.data.addPatient;
    });
  });
};

export const setupDevice = (
  device,
  supportedDiseaseTestPerformedList,
  specRunVersionName,
) => {
  let createdDeviceId, specimenTypeId;

  return getSpecimenTypes()
    .then((result) => {
      const specimenTypes = result.body.data.specimenTypes;
      specimenTypeId =
        specimenTypes.length > 0 ? specimenTypes[0].internalId : null;
    })
    .then(() =>
      createDeviceType({
        name: device.name,
        manufacturer: device.manufacturer,
        model: device.model,
        swabTypes: [specimenTypeId],
        supportedDiseaseTestPerformed: supportedDiseaseTestPerformedList,
        testLength: 15,
      }),
    )
    .then((deviceResult) => {
      createdDeviceId = deviceResult.body.data.createDeviceType.internalId;
    })
    .then(() => getCreatedFacility(specRunVersionName))
    .then((facility) =>
      addDeviceToFacility(
        { ...facility, street: "123 Main St", state: "NY", zipCode: "14221" },
        [createdDeviceId],
      ),
    )
    .then(() => {
      return {
        createdDeviceId: createdDeviceId,
        specimenTypeId: specimenTypeId,
      };
    });
};

export const setupMultiplexDevice = (specRunVersionName, multiplexDevice) => {
  let supportedDiseaseTestPerformedList;

  return getSupportedDiseases()
    .then((result) => {
      const supportedDiseases = result.body.data.supportedDiseases;
      const multiplexDiseaseNames = ["COVID-19", "Flu A", "Flu B", "RSV"];
      const multiplexDiseases = supportedDiseases.filter((x) =>
        multiplexDiseaseNames.includes(x.name),
      );
      supportedDiseaseTestPerformedList = multiplexDiseases.map(
        (disease, index) => {
          return {
            supportedDisease: disease.internalId,
            testPerformedLoincCode: `96741-${index}`,
            equipmentUid: `equipment-uid-${specRunVersionName}`,
            testkitNameId: `testkit-name-id-${specRunVersionName}`,
            testOrderedLoincCode: `96741-${index}`,
          };
        },
      );
    })
    .then(() =>
      setupDevice(
        multiplexDevice,
        supportedDiseaseTestPerformedList,
        specRunVersionName,
      ),
    );
};

export const setupCovidOnlyDevice = (specRunVersionName, covidOnlyDevice) => {
  let supportedDiseaseId;

  return getSupportedDiseases()
    .then((result) => {
      const supportedDiseases = result.body.data.supportedDiseases;
      supportedDiseaseId =
        supportedDiseases.length > 0 ? supportedDiseases[0].internalId : null;
    })
    .then(() =>
      setupDevice(
        covidOnlyDevice,
        [
          {
            supportedDisease: supportedDiseaseId,
            testPerformedLoincCode: `96741-1`,
            equipmentUid: `equipment-uid-${specRunVersionName}`,
            testkitNameId: `testkit-name-id-${specRunVersionName}`,
            testOrderedLoincCode: `96741-1`,
          },
        ],
        specRunVersionName,
      ),
    );
};

export const setupTestOrder = (
  specRunVersionName,
  patientId,
  deviceTypeId,
  specimenTypeId,
) => {
  return getCreatedFacility(specRunVersionName)
    .then((facility) =>
      addPatientToQueue({ facilityId: facility.id, patientId: patientId }),
    )
    .then(() => {
      const results = [
        {
          diseaseName: "COVID-19",
          testResult: "POSITIVE",
        },
      ];
      const submitQueueItemVariables = {
        patientId: patientId,
        deviceTypeId: deviceTypeId,
        specimenTypeId: specimenTypeId,
        results: results,
      };
      return submitQueueItem(submitQueueItemVariables);
    });
};
