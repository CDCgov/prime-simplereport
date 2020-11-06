import React from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { clearNotification } from "./state/testQueueActions";

import Alert from "../commonComponents/Alert";
import { getPatientById } from "../patients/patientSelectors";
import { QUEUE_NOTIFICATION_TYPES, ALERT_CONTENT } from "./constants";
import Expire from "../commonComponents/Expire";
import { getQueueNotification } from "../testQueue/testQueueSelectors";

const QueueNotification = () => {
  const notification = useSelector(getQueueNotification);
  const { notificationType, patientId } = { ...notification };
  const patient = useSelector(getPatientById(patientId));

  const dispatch = useDispatch();
  const onNotificationExpire = () => {
    dispatch(clearNotification());
  };
  const shouldDisplay = notification && Object.keys(notification).length > 0;
  if (!shouldDisplay) {
    return null;
  }

  let { type, title, body } = { ...ALERT_CONTENT[notificationType](patient) };
  return (
    <Expire delay={5000} onExpire={onNotificationExpire}>
      <Alert type={type} body={body} title={title} />
    </Expire>
  );
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
