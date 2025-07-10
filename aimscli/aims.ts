import {
  paginateListObjectsV2,
  GetObjectCommand, PutObjectCommand,
  S3Client,
  S3ServiceException
} from "@aws-sdk/client-s3";
import "dotenv/config";
import { ReceiveMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const exampleMessage = "MSH|^~\\&|^2.16.840.1.114222.4^ISO|^00D0000000^CLIA|^2.16.840.1.113883.3.8589^ISO|^2.16.840.1.113883.3.8589^ISO|20250710195641.4310+0000||ORU^R01^ORU_R01|c5e5d0bd-ebe4-4ad2-bbf7-656b1ce63475|P|2.5.1|||||USA||||PHLabReport-NoAck^phLabResultsELRv251^2.16.840.1.113883.9.11^ISO\n" +
  "SFT|SimpleReport|1bb1242|SimpleReport|1bb1242||20250708001354.0000+0000\n" +
  "PID|1||7e62231d-abf6-4a75-9fed-2c258ee47581^^^&2.16.840.1.114222.4&ISO^PI||User^Test||19900101|M||1002-5^American Indian or Alaska Native^HL70005|123 Main St^^Buffalo^NY^14221^USA||^^^^^716^5551234~^NET^Internet^test@example.com|||||||||H^Hispanic or Latino^HL70189\n" +
  "ORC|RE||6110f6f8-6bcf-44c6-a629-98dd6bbe6fdc^^2.16.840.1.114222.4^ISO|||||||||0000000000^Dracula^Count^^^^^^&2.16.840.1.113883.4.6&ISO^^^^NPI|||||||||Dracula Labs|201 W Capitol Ave^^Jefferson City^MO^65101-6809^USA|^^^^^555^5555555~^NET^Internet^dracula@example.com|^^^^^USA\n" +
  "OBR|1||6110f6f8-6bcf-44c6-a629-98dd6bbe6fdc^^2.16.840.1.114222.4^ISO|87949-4^Chlamydia trachomatis DNA [Presence] in Tissue by NAA with probe detection^LN|||20250710000000-0400|20250710000000-0400||||||||0000000000^Dracula^Count^^^^^^&2.16.840.1.113883.4.6&ISO^^^^NPI||||||20250710195641.4470+0000|||F\n" +
  "OBX|1|CE|87949-4^Chlamydia trachomatis DNA [Presence] in Tissue by NAA with probe detection^LN||260373001^^SNM||||||F|||20250710000000-0400|||||20250710000000-0400||||Dracula Labs^^^^^&2.16.840.1.113883.4.7&ISO^FI^^^00D0000000|201 W Capitol Ave^^Jefferson City^MO^65101-6809^USA\n" +
  "SPM|1|c2bb1bed-b060-451c-b7ab-92cca8f32eb7&&2.16.840.1.114222.4&ISO^c2bb1bed-b060-451c-b7ab-92cca8f32eb7&&2.16.840.1.114222.4&ISO||258479004^^SNM^^^^June 2025||||85756007^Body tissue structure^SNM^^^^June 2025|||||||||20250710000000-0400^20250710000000-0400|20250710000000-0400"


const getS3Object = async (objectKey: string) => {
  if (!objectKey) {
    throw new Error("Object key missing for getS3Object");
  }
  if (!objectKey.includes(process.env.AIMS_USER_ID_TEST)) {
    throw new Error("Object key missing AIMS_USER_ID_TEST");
  }
  if (!objectKey.includes("/ReceiveFrom/") && !objectKey.includes("/SendTo/")) {
    throw new Error("Object key should include either /ReceiveFrom/ or /SendTo/.");
  }
  // Intellij has an annoying bug with parsing some of the AWS SDK types
  // https://youtrack.jetbrains.com/issue/WEB-63867/AWS-SDK-types-are-wrongly-parsed
  // @ts-ignore
  const client = new S3Client({
    credentials: {
      accessKeyId: process.env.AIMS_ACCESS_KEY_ID_TEST,
      secretAccessKey: process.env.AIMS_SECRET_ACCESS_KEY_TEST,
    },
    region: "us-east-1",
  });
  const bucketName = process.env.AIMS_S3_BUCKET_NAME_TEST;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  try {
    console.log('Retrieving S3 object:\n');
    // @ts-ignore
    const response = await client.send(command);
    const responseString = await response["Body"].transformToString();
    console.log(responseString);
  } catch (caught) {
    if (
      caught instanceof S3ServiceException &&
      caught.name === "EntityTooLarge"
    ) {
      console.error(
        `Error from S3 while uploading object to ${bucketName}. \
The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
or the multipart upload API (5TB max).`
      );
    } else if (caught instanceof S3ServiceException) {
      console.error(
        `Error from S3 while uploading object to ${bucketName}.  ${caught.name}: ${caught.message}`
      );
    } else {
      throw caught;
    }
  }
};

const listObjectsInS3Bucket = async (objectPrefix: string) => {
  if (!objectPrefix) {
    throw new Error("Object prefix missing for listObjectsInS3Bucket");
  }
  // https://youtrack.jetbrains.com/issue/WEB-63867/AWS-SDK-types-are-wrongly-parsed
  // @ts-ignore
  const client = new S3Client({
    credentials: {
      accessKeyId: process.env.AIMS_ACCESS_KEY_ID_TEST,
      secretAccessKey: process.env.AIMS_SECRET_ACCESS_KEY_TEST,
    },
    region: "us-east-1",
  });
  const bucketName = process.env.AIMS_S3_BUCKET_NAME_TEST;
  const pageSize = 10;

  const objects = [];
  try {
    const paginator = paginateListObjectsV2(
      { client, /* Max items per page */ pageSize: pageSize },
      { Bucket: bucketName, Prefix: objectPrefix },
    );

    for await (const page of paginator) {
      objects.push(page.Contents.map((o) => o.Key));
    }
    objects.forEach((objectList, pageNum) => {
      console.log(
        `Page ${pageNum + 1}\n------\n${objectList.map((o) => `• ${o}`).join("\n")}\n`,
      );
    });
  } catch (caught) {
    if (
      caught instanceof S3ServiceException &&
      caught.name === "NoSuchBucket"
    ) {
      console.error(
        `Error from S3 while listing objects for "${bucketName}". The bucket doesn't exist.`,
      );
    } else if (caught instanceof S3ServiceException) {
      console.error(
        `Error from S3 while listing objects for "${bucketName}".  ${caught.name}: ${caught.message}`,
      );
    } else {
      throw caught;
    }
  }
}

const uploadMessageToS3 = async () => {
  // https://youtrack.jetbrains.com/issue/WEB-63867/AWS-SDK-types-are-wrongly-parsed
  // @ts-ignore
  const client = new S3Client({
    credentials: {
      accessKeyId: process.env.AIMS_ACCESS_KEY_ID_TEST,
      secretAccessKey: process.env.AIMS_SECRET_ACCESS_KEY_TEST,
    },
    region: "us-east-1",
  });
  const bucketName = process.env.AIMS_S3_BUCKET_NAME_TEST;
  const fileName = `test-hl7-message-${Date.now()}.hl7`;
  const objectKey = process.env.AIMS_USER_ID_TEST + "/SendTo/" + fileName;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    Body: exampleMessage,
    SSEKMSKeyId: process.env.AIMS_KMS_ENCRYPTION_KEY_TEST,
    ServerSideEncryption: "aws:kms",
    Metadata: {
      AIMSPlatformSender: "Dracula Labs",
      AIMSPlatformRecipient: "AIMSPlatform",
      AIMSPlatformSenderProject: "ELR",
      AIMSPlatformSenderProtocol: "S3",
      AIMSPlatformSenderEncryptionType: "KMS",
      AIMSPlatformFilename: fileName,
      // this should match the internal message id
      AIMSPlatformSenderMessageId: "c5e5d0bd-ebe4-4ad2-bbf7-656b1ce63475",
      Base64Encoded: "False"
    }
  });

  try {
    // @ts-ignore
    const response = await client.send(command);
    console.log(response);
  } catch (caught) {
    if (
      caught instanceof S3ServiceException &&
      caught.name === "EntityTooLarge"
    ) {
      console.error(
        `Error from S3 while uploading object to ${bucketName}. \
The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
or the multipart upload API (5TB max).`
      );
    } else if (caught instanceof S3ServiceException) {
      console.error(
        `Error from S3 while uploading object to ${bucketName}.  ${caught.name}: ${caught.message}`
      );
    } else {
      throw caught;
    }
  }
};

const peekResponseQueue = async () => {
  // https://youtrack.jetbrains.com/issue/WEB-63867/AWS-SDK-types-are-wrongly-parsed
  // @ts-ignore
  const client = new SQSClient({
    credentials: {
      accessKeyId: process.env.AIMS_ACCESS_KEY_ID_TEST,
      secretAccessKey: process.env.AIMS_SECRET_ACCESS_KEY_TEST,
    },
    region: "us-east-1",
  });
  const queueName = process.env.AIMS_MESSAGE_QUEUE_ENDPOINT_TEST;
  const waitTimeSeconds = 5;

  const command = new ReceiveMessageCommand({
    QueueUrl: queueName,
    WaitTimeSeconds: waitTimeSeconds
  });
  console.log(`Retrieving message from queue and waiting for ${waitTimeSeconds} seconds...`);
  try {
    // @ts-ignore
    const response = await client.send(command);
    console.log(response);
  } catch (caught) {
    if (caught instanceof S3ServiceException) {
      console.error(
        `Error from S3 while peeking queue ${queueName}.  ${caught.name}: ${caught.message}`
      );
    } else {
      throw caught;
    }
  }
};

const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];
  const objectKey = args[1];

  switch (command.toLowerCase()) {
    case "upload":
      console.log('Uploading example message');
      await uploadMessageToS3();
      break;
    case "listsent":
      console.log('Listing sent messages');
      await listObjectsInS3Bucket(process.env.AIMS_USER_ID_TEST + "/SendTo/");
      console.log('If you want to retrieve the contents of a message:\n- copy the full object key listed above\n- use the getMessage command with the object key as the second argument\n- node aims.ts getMessage OBJECT_KEY_HERE');
      break;
    case "listresponse":
      console.log('Listing AIMS responses');
      await listObjectsInS3Bucket(process.env.AIMS_USER_ID_TEST + "/ReceiveFrom/");
      break;
    case "peekqueue":
      await peekResponseQueue();
      break;
    case "getmessage":
      if (args.length < 2) {
        console.error("Missing argument for the S3 object key");
      } else {
        await getS3Object(objectKey);
      }
      break;
    case "--help":
    case "help":
      console.log("\nCommands:" +
        "\nupload - uploads the exampleMessage defined at the top of this file" +
        "\nlistSent - lists the S3 bucket contents of messages we've sent" +
        "\nlistResponse - lists the S3 bucket contents of responses from AIMS" +
        "\npeekQueue - retrieves the first item in the AIMS SQS response queue, but does not remove it from the queue" +
        "\ngetMessage - retrieves the contents of a specific S3 object defined by the object key which must be passed as the second argument" +
        "\n");
      break;
    default:
      console.error("Missing or invalid command line arguments");
  }
}

await main();
