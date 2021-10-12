import React from "react";

const DeviceTypeReminderMessage = () => (
  <div>
    <div className="usa-alert usa-alert--warning">
      <div className="usa-alert__body">
        <h4 className="usa-alert__heading">Reminder</h4>
        <p className="usa-alert__text">
          Notify ReportStream of devices added in{" "}
          <a
            href="https://usds.slack.com/archives/C024MGSJZ38"
            target="_blank"
            rel="noreferrer"
          >
            #prime-reportstream
          </a>
          .
        </p>
        <p>
          Device details can be found by downloading the mapping tool (Excel
          file) from the{" "}
          <a
            href="https://www.cdc.gov/csels/dls/sars-cov-2-livd-codes.html"
            target="_blank"
            rel="noreferrer"
          >
            CDC test code mapping for COVID-19 page
          </a>
          .
        </p>
      </div>
    </div>
  </div>
);

export default DeviceTypeReminderMessage;
