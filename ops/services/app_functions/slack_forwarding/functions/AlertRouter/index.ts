import {AzureFunction, Context, HttpRequest} from '@azure/functions';
const fetch = require('node-fetch');
const util = require('util')

let app_insight_url = 'https://portal.azure.com/#@cdc.onmicrosoft.com/resource/subscriptions/7d1e3999-6577-4cd5-b296-f518e5c8e677/resourcegroups/prime-simple-report-management/providers/microsoft.insights/components/prime-simple-report-global-insights/overview';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    // context will allow logging statements to appear in Azure
    context.log('HTTP trigger function processed a request.');
    context.log('Alert received:: ', util.inspect(req.body, {showHidden: false, depth: null}));
    context.log(JSON.stringify(req.body))

    const webhook = process.env["SLACK_WEBHOOK"];
    console.log("Connecting to: ", webhook);
    if (webhook === undefined) {
        context.res = {
            status: 400,
            body: 'Missing required SLACK_WEBHOOK environment variable'
        }
        return
    }

    if (req.body !== undefined) {
        context.log("sending to slack");
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

async function sendToSlack(url: string, alert: any) {

    return fetch(url, {
        method: 'post',
        body: JSON.stringify(generateSlackMessage(alert))
    });
}

function generateSlackMessage(alert: any): any {
    let headerText;
    let alertName;
    // Generate the heading text
    let alert_type;
    if (alert.data.alertContext.conditionType === 'WebtestLocationAvailabilityCriteria'){
        app_insight_url = 'https://portal.azure.com/#@cdc.onmicrosoft.com/resource/subscriptions/7d1e3999-6577-4cd5-b296-f518e5c8e677/resourcegroups/prime-simple-report-management/providers/microsoft.insights/components/prime-simple-report-global-insights/availability'
        alert_type = "Ping Availability"
        alertName = alert.data.essentials.alertRule.slice(0, alert.data.essentials.alertRule.indexOf('-prime-simple-report-global-insights'));
    } else if (alert.data.alertContext.conditionType === 'SingleResourceMultipleMetricCriteria') {
        alert_type = `${alert.data.essentials.alertRule}`
        alertName = alert.data.essentials.description;
        app_insight_url = `https://portal.azure.com/#@cdc.onmicrosoft.com/resource/${alert.data.essentials.alertTargetIDs[0]}`
    }

    let alert_type_emoji;
    if(alert.data.essentials.severity === 'Sev1'){
        alert_type_emoji = ':rotating-light-red-siren:'
    } else {
        alert_type_emoji = ':warning:'
    }

    headerText = `${alert_type_emoji} ${alert_type}: ${alertName} ${alert.data.essentials.monitorCondition}`;

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
                    type: 'mrkdwn',
                    text: `Details here:\n${app_insight_url}.`
                }
            }
        ]
    }
}

export default httpTrigger;
