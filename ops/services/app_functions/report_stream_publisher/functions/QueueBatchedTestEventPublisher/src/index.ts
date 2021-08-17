import { DefaultAzureCredential } from "@azure/identity";
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { QueueServiceClient } from "@azure/storage-queue";

const account = "<account>";
const credential = new DefaultAzureCredential();
const queueName = process.env.QUEUE_NAME;

const queueServiceClient = new QueueServiceClient(
  `https://${account}.queue.core.windows.net`,
  credential
);

const MINIMUM_MESSAGES = 100;

const QueueBatchedTestEventPublisher: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    if(queueName === undefined) {
        context.log('Queue name undefined');
        return;
    }
    
    const queueClient = queueServiceClient.getQueueClient(queueName);
    const queueProperties = await queueClient.getProperties();
    const approxMessageCount = queueProperties.approximateMessagesCount;

    if(approxMessageCount === undefined) {
        context.log('Queue message count is undefined');
        return;
    }

    if(approxMessageCount < MINIMUM_MESSAGES) {
        context.log(`Queue count of ${approxMessageCount} was < ${MINIMUM_MESSAGES}; aborting`);
        return;
    }

    context.log('Beginning execution');

    const dequeueResponse = await queueClient.receiveMessages();
  if (dequeueResponse.receivedMessageItems.length == 1) {
    const dequeueMessageItem = dequeueResponse.receivedMessageItems[0];
    console.log(`Processing & deleting message with content: ${dequeueMessageItem.messageText}`);
    const deleteMessageResponse = await queueClient.deleteMessage(
      dequeueMessageItem.messageId,
      dequeueMessageItem.popReceipt
    );
    console.log(
      `Delete message successfully, service assigned request Id: ${deleteMessageResponse.requestId}`
    );
  }

    context.res = {
        status: 200, /* Defaults to 200 */
        // body: success"
    };
};

export default QueueBatchedTestEventPublisher;