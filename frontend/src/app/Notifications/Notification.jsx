import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Alert from "../commonComponents/Alert";
import { getNotification } from "./notificationsSelector";

const Notification = () => {
  const notification = useSelector(getNotification);

  let shouldDisplay = Object.keys(notification).length > 0;
  if (!shouldDisplay) {
    return null;
  }

  let { type, title, body } = { ...notification };

  return <Alert type={type} body={body} title={title} />;
};

export default Notification;
