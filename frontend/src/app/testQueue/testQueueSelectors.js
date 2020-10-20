export const getPatientsInTestQueue = (state) => {
  console.log("keys:", Object.keys(state.testQueue));
  console.log("inqueue:", state);
  return Object.keys(state.testQueue).filter(
    (patientId) => state.testQueue[patientId]
  );
};
