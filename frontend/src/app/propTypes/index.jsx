import PropTypes from "prop-types";
import { COVID_RESULTS } from "../constants";

export const testRegistrationPropType = PropTypes.shape({
  testResgistrationId: PropTypes.string,
  firstName: PropTypes.string,
  middleName: PropTypes.string,
  lastName: PropTypes.string,
  birthDate: PropTypes.string,
  address: PropTypes.string,
  phone: PropTypes.string,
});

// TODO: we should probably strip out the testRegistration props from this
export const testResultPropType = PropTypes.shape({
  testId: PropTypes.string,
  testResgistrationId: PropTypes.string,
  firstName: PropTypes.string,
  middleName: PropTypes.string,
  lastName: PropTypes.string,
  birthDate: PropTypes.string,
  address: PropTypes.string,
  phone: PropTypes.string,
  testResult: PropTypes.oneOf([
    COVID_RESULTS.DETECTED,
    COVID_RESULTS.NOT_DETECTED,
    COVID_RESULTS.INCONCLUSIVE,
  ]),
});
