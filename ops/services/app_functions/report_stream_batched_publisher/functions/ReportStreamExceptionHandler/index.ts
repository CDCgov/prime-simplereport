import { AzureFunction, Context } from "@azure/functions";
import { ENV } from "../config";

const { SIMPLE_REPORT_CB_TOKEN, SIMPLE_REPORT_CB_URL } = ENV;

const queueTrigger: AzureFunction = async function (
  context: Context,
  body: string
): Promise<void> {
  const result = await fetch(SIMPLE_REPORT_CB_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-functions-key": SIMPLE_REPORT_CB_TOKEN,
    },
    body,
  });
  if (!result.ok) {
    throw new Error(`${result.status}: ${await result.text()}`);
  }
};

export default queueTrigger;
