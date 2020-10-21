import React from "react";
import PropTypes from "prop-types";

import { useSelector } from "react-redux";
import { getPatientById } from "../patients/patientSelectors";
import Alert from "../commonComponents/Alert";
import { QUEUE_NOTIFICATION_TYPES } from "./state/testQueueActions";
import { displayFullName } from "../utils";

const ALERT_CONTENT = {
  [QUEUE_NOTIFICATION_TYPES.ADDED_TO_QUEUE__SUCCESS]: (patient) => {
    return {
      type: "success",
      title: `${displayFullName(
        patient.firstName,
        patient.middleName,
        patient.lastName
      )} was added to the queue`,
      body: "Newly added patients go to the bottom of the queue",
    };
  },
};

const QueueNotification = ({ notification }) => {
  const { notificationType, patientId } = { ...notification };
  const patient = useSelector(getPatientById(patientId));

  let { type, title, body } = { ...ALERT_CONTENT[notificationType](patient) };

  return <Alert type={type} body={body} title={title} />;
};

QueueNotification.propTypes = {
  notification: PropTypes.shape({
    notificationType: PropTypes.oneOf([
      ...Object.values(QUEUE_NOTIFICATION_TYPES),
    ]),
    patientId: PropTypes.string,
  }),
};
export default QueueNotification;
