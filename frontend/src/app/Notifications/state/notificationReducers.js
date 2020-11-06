import {
  NOTIFICATION__SET_NOTIFICATION,
  NOTIFICATION__REMOVE_NOTIFICATION,
} from "./notificationActionTypes";

export default (state = {}, action) => {
  switch (action.type) {
    case NOTIFICATION__SET_NOTIFICATION:
      return action.payload;

    case NOTIFICATION__REMOVE_NOTIFICATION:
      return {};

    default:
      return state;
  }
};
