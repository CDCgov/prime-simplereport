import PropTypes from "prop-types";
import { COVID_RESULTS } from "../constants";

export const patientPropType = PropTypes.shape({
  patientId: PropTypes.string,
  firstName: PropTypes.string,
  middleName: PropTypes.string,
  lastName: PropTypes.string,
  birthDate: PropTypes.string,
  address: PropTypes.string,
  phone: PropTypes.string,
  city: PropTypes.string,
  state: PropTypes.string,
});

// TODO: we should probably strip out the patient props from this
// export const testResultPropType = PropTypes.shape({
//   testId: PropTypes.string,
//   patientId: PropTypes.string,
//   firstName: PropTypes.string,
//   middleName: PropTypes.string,
//   lastName: PropTypes.string,
//   birthDate: PropTypes.string,
//   address: PropTypes.string,
//   phone: PropTypes.string,
//   testResult: PropTypes.oneOf([
//     COVID_RESULTS.POSITIVE,
//     COVID_RESULTS.NEGATIVE,
//     COVID_RESULTS.INCONCLUSIVE,
//   ]),
// });

export const testResultPropType = PropTypes.shape({
  id: PropTypes.string,
  patientId: PropTypes.string,
  testResult: PropTypes.oneOf([
    COVID_RESULTS.POSITIVE,
    COVID_RESULTS.NEGATIVE,
    COVID_RESULTS.INCONCLUSIVE,
  ]),
});
