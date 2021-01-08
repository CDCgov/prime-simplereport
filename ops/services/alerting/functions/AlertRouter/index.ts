import {AlertSchema, isAlertSchema} from './schema';
import {AzureFunction, Context, HttpRequest} from '@azure/functions';
const fetch = require('node-fetch');

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context.log('I have a request: ', req.body);

    const webhook = process.env["SLACK_WEBHOOK"];
    console.log("Connecting to: ", webhook);
    if (webhook === undefined) {
        context.res = {
            status: 400,
            body: 'Missing required SLACK_WEBHOOK environment variable'
        }
        return
    }

    if (req.body !== undefined && isAlertSchema(req.body)) {
        // I'm not really sure why the type guards aren't working correctly, but this is pretty simple
        // Send to Slack
        context.log("I have an alert, sending to slack");
        const res = await sendToSlack(webhook, req.body);

        context.res = {
            status: res.status,
            body: res.statusText
        }

    } else {
        context.log("I don't have an alert, ignoring");
        context.res = {
            status: 400,
            body: 'Not a common alert'
        }
    }
};

async function sendToSlack(url: string, alert: AlertSchema) {

    return fetch(url, {
        method: 'post',
        body: JSON.stringify(generateSlackMessage(alert))
    });
}

function generateSlackMessage(alert: AlertSchema): any {

    let notificationTime;
    if (alert.data.essentials.monitorCondition == 'Resolved') {
        notificationTime = new Date(alert.data.essentials.resolvedDateTime);
    } else {
       notificationTime = new Date(alert.data.essentials.firedDateTime);
    }

    // Generate the heading text
    const headerText = `${alert.data.essentials.severity} Alert ${alert.data.essentials.monitorCondition}`;

    return {
        blocks: [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: headerText
                }
            },
            {
                type: 'section',
                text: {
                    type: 'plain_text',
                    text: `${alert.data.essentials.monitorCondition} @ ${notificationTime}`
                }
            }
        ]
    }
}

export default httpTrigger;
