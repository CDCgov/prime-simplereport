const https = require('https');
const uploaderVersion = "2021-04-26";

module.exports = async function(context, message) {
  const response = JSON.parse(await postRequest(
      fetchFromEnvironmentOrThrow(
          "REPORT_STREAM_URL",
          "ReportStream URL to which tests should be reported"
      ),
      {
        'x-functions-key': fetchFromEnvironmentOrThrow(
            "REPORT_STREAM_TOKEN",
            "ReportStream token"
        ),
        'content-type': 'text/csv',
        'client': 'simple_report_queue_worker',
        'x-api-version': uploaderVersion,
      },
      jsonToCsv(message)
  ));

  logResponseData(response.errors, err => {
    console.error("Upload unsuccessful", err);
    throw new Error("Upload did not complete successfully");
  });
  logResponseData(response.warnings, el => console.warn("Warning received", el));
  logResponseData(response.destinations, el => console.log("Upload succeeded", el));
};

function logResponseData(responseDataArray, logFunc) {
  if (Array.isArray(responseDataArray) && responseDataArray.length > 0) {
    for (const el of responseDataArray) {
      logFunc(el);
    }
  }
}

/**
 * @param url The URL to which data should be sent.
 * @param headers Custom headers to attach to the request.
 * @param payload The request payload
 * @returns {Promise<string>}
 */
function postRequest(url, headers, payload) {
  return new Promise((resolve, reject) => {
    const {
      hostname,
      pathname,
      port,
      protocol,
      search,
    } = new URL(url);
    const requestOptions = {
      headers,
      hostname,
      method: "POST",
      path: pathname + search,
      port: port ? Number(port) : undefined,
      protocol,
    };

    const request = https.request(requestOptions, res => {
      let data = "";
      res.on("data", d => {
        data += d;
      });

      res.on("error", reject);

      res.on("end", () => resolve(data));
    });

    request.on("error", reject);

    request.end(payload);
  });
}

function fetchFromEnvironmentOrThrow(variableName, description) {
  const value = process.env[variableName];
  if (value) {
    return value;
  }

  throw new Error(
      `The ${
        description
      } must be provided via the ${
        variableName
      } environment variable, but this variable was empty.`
  );
}

function jsonToCsv(message) {
  const parsed = JSON.parse(message);
  if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
    throw new Error("Queue messages must be formatted as JSON objects.");
  }

  const headers = [];
  const data = [];
  for (const key of Object.keys(parsed)) {
    headers.push(key);
    data.push(formatValue(parsed[key]));
  }

  return `${headers.join(',')}\n${data.join(',')}`;
}

function formatValue(value) {
  if (typeof value === 'string') {
    return `"${value.replace(/"/g, '""')}"`;
  }

  if (typeof value === 'undefined' || value === null) {
    return `""`;
  }

  return value;
}
