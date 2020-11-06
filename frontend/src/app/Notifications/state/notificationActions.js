import {
  NOTIFICATION__SET_NOTIFICATION,
  NOTIFICATION__REMOVE_NOTIFICATION,
} from "./notificationActionTypes";

export const _addNotification = (type, title, body, timeout) => {
  return {
    type: NOTIFICATION__SET_NOTIFICATION,
    payload: {
      type,
      title,
      body,
      timeout,
    },
  };
};

export const removeNotification = () => {
  return {
    type: NOTIFICATION__REMOVE_NOTIFICATION,
  };
};

export const addNotification = (type, title, body, timeout) => {
  return (dispatch) => {
    dispatch(_addNotification(type, title, body, timeout));

    setTimeout(() => {
      dispatch(removeNotification());
    }, timeout);
  };
};
