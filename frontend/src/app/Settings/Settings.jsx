import React from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { clearNotification } from "./state/testQueueActions";

// import Alert from "../commonComponents/Alert";
// import { getPatientById } from "../patients/patientSelectors";
// import Expire from "../commonComponents/Expire";
// import { getQueueNotification } from "../testQueue/testQueueSelectors";
import DeviceSettings from "./DeviceSettings";
const Settings = () => {
  //   const notification = useSelector(getQueueNotification);
  //   const { notificationType, patientId } = { ...notification };
  //   const patient = useSelector(getPatientById(patientId));

  //   const dispatch = useDispatch();
  //   const onNotificationExpire = () => {
  //     dispatch(clearNotification());
  //   };
  //   const shouldDisplay = notification && Object.keys(notification).length > 0;
  //   if (!shouldDisplay) {
  //     return null;
  //   }

  //   let { type, title, body } = { ...ALERT_CONTENT[notificationType](patient) };
  return (
    <main className="prime-home">
      <div className="grid-container">
        <h2>Global Settings</h2>
      </div>
      <DeviceSettings />
    </main>
  );
};

export default Settings;
