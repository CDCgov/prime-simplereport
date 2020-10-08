import {
  birthDate,
  firstName,
  middleName,
  lastName,
  address,
  phone,
  city,
  state,
  zip,
  patientId,
  createMappingInterface,
} from "../../utils/mappers";

export const patientMapping = createMappingInterface([
  birthDate,
  firstName,
  middleName,
  lastName,
  address,
  phone,
  city,
  state,
  zip,
  patientId,
]);
