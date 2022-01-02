import { PubSub } from "@google-cloud/pubsub";
import * as functions from "firebase-functions";

export const addTask = functions.https.onRequest(async (_req, res) => {
  functions.logger.info("START: addTask");

  const pubsub = new PubSub();
  const topic = pubsub.topic("functions-retry");
  await topic.publishMessage({ json: {} });

  res.status(200).send("ok");
});

export const pubsubTask = functions
  .runWith({ failurePolicy: { retry: {} } })
  .pubsub.topic("functions-retry")
  .onPublish(async (_msg, context) => {
    functions.logger.info("START: pubsubTask");

    const eventAgeMs = Date.now() - Date.parse(context.timestamp);
    const eventMaxAgeMs = 60 * 1000;
    if (eventAgeMs > eventMaxAgeMs) {
      console.log(`Dropping event ${context} with age[ms]: ${eventAgeMs}`);
      return 0;
    }

    throw new Error("Retrying...");
  });
