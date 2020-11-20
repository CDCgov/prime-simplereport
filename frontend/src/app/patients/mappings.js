import {
  birthDate,
  firstName,
  middleName,
  lastName,
  address,
  telephone,
  city,
  state,
  zip,
  patientId,
  createMappingInterface,
} from "../utils/mappers";

export const patientMapping = createMappingInterface([
  birthDate,
  firstName,
  middleName,
  lastName,
  address,
  telephone,
  city,
  state,
  zip,
  patientId,
]);
