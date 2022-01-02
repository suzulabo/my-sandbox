Firebase Functions のリトライは 7 日間継続される。頻度は調整できない。

https://firebase.google.com/docs/functions/retries?hl=ja

ただし Pubsub trigger についてはサブスクリプションの設定で調整できる？

https://dev.to/danielsc/firebase-function-retries-with-pubsub-3jf9

## 設定なし

```typescript
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
```

毎秒 1.4 回ペースでリトライされていた(危険！)

## PubSub を設定

https://cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/update

```
gcloud pubsub subscriptions update \
 projects/suzulabo-sandbox/subscriptions/gcf-pubsubTask-us-central1-functions-retry \
 --min-retry-delay=60s \
 --max-retry-delay=60s \
 --message-retention-duration=10m
```

1 分ごとにリトライ、最大 10 分(10 分が最小)までにできた

retry-delay は 600 秒まで  
message-retention-duration は最小 10 分

この設定は GCP Console からも可能  
(PubSub -> サブスクリプション)

再度 Firebase Deploy しても消えることはなかったので一度やれば OK
