// dummy responses for async queries
export const demoPatients = [
  {
    patientId: "abc123",
    firstName: "Edward",
    middleName: "",
    lastName: "Teach",
    birthDate: "01/01/1717",
    address: "123 Plank St, Nassau",
    phone: "(123) 456-7890",
  },
  {
    patientId: "def456",
    firstName: "James",
    middleName: "D.",
    lastName: "Flint",
    birthDate: "01/01/1719",
    address: "456 Plank St, Nassau",
    phone: "(321) 546-7890",
  },
  {
    patientId: "ghi789",
    firstName: "John",
    middleName: "'Long'",
    lastName: "Silver",
    birthDate: "01/01/1722",
    address: "789 Plank St, Nassau",
    phone: "(213) 645-7890",
  },
];

// dummy initial data to populate redux
export const initialPatientState = {
  abc123: {
    patientId: "abc123",
    firstName: "Edward",
    middleName: "",
    lastName: "Teach",
    birthDate: "01/01/1717",
    address: "123 Plank St, Nassau",
    phone: "(123) 456-7890",
    testResultId: "testResult1",
  },
  def456: {
    patientId: "def456",
    firstName: "James",
    middleName: "D.",
    lastName: "Flint",
    birthDate: "01/01/1719",
    address: "456 Plank St, Nassau",
    phone: "(321) 546-7890",
    testResultId: "testResult2",
  },
  ghi789: {
    patientId: "ghi789",
    firstName: "John",
    middleName: "'Long'",
    lastName: "Silver",
    birthDate: "01/01/1722",
    address: "789 Plank St, Nassau",
    phone: "(213) 645-7890",
    testResultId: "testResult3",
  },
};
