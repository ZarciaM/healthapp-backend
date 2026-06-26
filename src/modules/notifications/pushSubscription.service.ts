import { Types } from "mongoose";
import PushSubscription from "./pushSubscription.model.js";

type SubscriptionData = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function upsertSubscription(
  userId: string,
  data: SubscriptionData,
) {
  const subscription = await PushSubscription.findOneAndUpdate(
    { endpoint: data.endpoint },
    {
      $set: {
        userId: new Types.ObjectId(userId),
        keys: data.keys,
      },
    },
    { upsert: true, new: true },
  );

  return subscription;
}

export async function removeSubscription(
  userId: string,
  endpoint?: string,
) {
  const filter: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
  };

  if (endpoint) {
    filter.endpoint = endpoint;
  }

  await PushSubscription.deleteMany(filter);
}

export async function removeSubscriptionByEndpoint(endpoint: string) {
  await PushSubscription.deleteOne({ endpoint });
}
