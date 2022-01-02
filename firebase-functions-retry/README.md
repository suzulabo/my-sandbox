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
