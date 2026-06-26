import mongoose, { Schema } from "mongoose";
import type { IDataShare } from "./dataSharing.types.js";

const dataShareSchema = new Schema<IDataShare>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    partnerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    scope: {
      type: String,
      enum: ["menstrual_cycle"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "revoked", "declined"],
      default: "pending",
    },
    invitationToken: {
      type: String,
      required: true,
      unique: true,
    },
    emailSentSuccessfully: {
      type: Boolean,
      default: false,
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },
    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

dataShareSchema.index({ ownerId: 1, scope: 1 });
dataShareSchema.index({ partnerId: 1, scope: 1, status: 1 });
dataShareSchema.index(
  { ownerId: 1, partnerEmail: 1, scope: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "accepted"] } },
  },
);

export default mongoose.model<IDataShare>("DataShare", dataShareSchema);
