import React from "react";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "./SRToastContainer.scss";

const SRToastContainer = () => {
  return (
    <ToastContainer
      autoClose={5000}
      closeButton={true}
      hideProgressBar={true}
      limit={2}
      position="bottom-left"
    />
  );
};

export default SRToastContainer;
