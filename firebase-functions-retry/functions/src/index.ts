import { PubSub } from "@google-cloud/pubsub";
import * as functions from "firebase-functions";

export const addTask = functions.https.onRequest(async (_req, res) => {
  functions.logger.info("addTask");

  const pubsub = new PubSub();
  const topic = pubsub.topic("functions-retry");
  await topic.publishMessage({ json: {} });

  res.status(200).send("ok");
});

export const pubsubTask = functions.pubsub
  .topic("functions-retry")
  .onPublish(async () => {
    functions.logger.info("pubsubTask");
    return 0;
  });
