import PropTypes from "prop-types";

import { COVID_RESULTS } from "../constants";

export const patientPropType = PropTypes.shape({
  patientId: PropTypes.string,
  firstName: PropTypes.string,
  middleName: PropTypes.string,
  lastName: PropTypes.string,
  birthDate: PropTypes.string,
  address: PropTypes.string,
  telephone: PropTypes.string,
  city: PropTypes.string,
  state: PropTypes.string,
});

export const testResultPropType = PropTypes.shape({
  id: PropTypes.string,
  patientId: PropTypes.string,
  testResult: PropTypes.oneOf([
    COVID_RESULTS.POSITIVE,
    COVID_RESULTS.NEGATIVE,
    COVID_RESULTS.INCONCLUSIVE,
  ]),
});

export const devicePropType = PropTypes.shape({
  id: PropTypes.string,
  displayName: PropTypes.string,
});
