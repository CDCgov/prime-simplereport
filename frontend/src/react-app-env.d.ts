/// <reference types="react-scripts" />

interface User {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
}

type TestResult = "POSITIVE" | "NEGATIVE" | "UNDETERMINED";
