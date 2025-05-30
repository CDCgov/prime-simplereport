import axios from "axios";

// Configuration with fixed values, no auth
const GRAPHQL_URL = "http://localhost:8080/graphql";
const FACILITY_ID = "ed14ab4b-a65c-4105-bacf-c7d4214b4fd5";
const PATIENT_ID = "5b60320e-7016-4878-955f-a423fa3d2576";
const DEVICE_TYPE_ID = "3d0f666d-a122-4c9d-801b-563ecf471021";
const SPECIMEN_TYPE_ID = "7c1e58f4-8e3e-4fbd-9f68-1028a4ab3c81";

async function executeGraphQL(query: string, variables: any): Promise<any> {
  try {
    const response = await axios.post(
      GRAPHQL_URL,
      {
        query,
        variables,
        operationName: variables.operationName,
      },
      {
        headers: {
          "Content-Type": "application/json",
          // Removed Authorization header since no auth
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("GraphQL request failed:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
}

async function addPatientToQueue(): Promise<void> {
  const query = `
    mutation AddPatientToQueue($facilityId: ID!, $patientId: ID!) {
      addPatientToQueue(
        facilityId: $facilityId,
        patientId: $patientId
      )
    }
  `;

  const variables = {
    facilityId: FACILITY_ID,
    patientId: PATIENT_ID,
    operationName: "AddPatientToQueue",
  };

  const result = await executeGraphQL(query, variables);
  console.log("Added patient to queue:", result);
}

async function submitTestResult(testResult: string): Promise<void> {
  const query = `
    mutation SubmitQueueItem(
      $patientId: ID!,
      $deviceTypeId: ID!,
      $specimenTypeId: ID!,
      $results: [MultiplexResultInput]!
    ) {
      submitQueueItem(
        patientId: $patientId,
        deviceTypeId: $deviceTypeId,
        specimenTypeId: $specimenTypeId,
        results: $results
      ) {
        testResult {
          internalId
        }
        deliverySuccess
        testEventId
      }
    }
  `;

  const variables = {
    patientId: PATIENT_ID,
    deviceTypeId: DEVICE_TYPE_ID,
    specimenTypeId: SPECIMEN_TYPE_ID,
    results: [
      {
        diseaseName: "COVID-19",
        testResult: testResult,
      },
    ],
    operationName: "SubmitQueueItem",
  };

  const result = await executeGraphQL(query, variables);
  console.log("Submitted test result:", result);
}

async function generateTestData(count: number): Promise<void> {
  console.log(`Generating ${count} test results...`);

  for (let i = 0; i < count; i++) {
    const testResult = i % 2 === 0 ? "POSITIVE" : "NEGATIVE";

    console.log(`Creating test #${i + 1} (${testResult})`);

    try {
      await addPatientToQueue();
      await submitTestResult(testResult);
      console.log(`Completed test #${i + 1}\n`);
    } catch (error) {
      console.error(`Failed to create test #${i + 1}\n`);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`Completed generating ${count} test results`);
}

const count = process.argv.length > 2 ? parseInt(process.argv[2], 10) : 10;

generateTestData(count).catch(console.error);
