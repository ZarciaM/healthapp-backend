import type { Types } from "mongoose";

export type SharingScope = "menstrual_cycle";

export type SharingStatus = "pending" | "accepted" | "revoked" | "declined";

export type SanitizedShare = Omit<IDataShare, "invitationToken">;

export interface IDataShare {
  ownerId: Types.ObjectId;
  partnerId?: Types.ObjectId;
  partnerEmail: string;
  scope: SharingScope;
  status: SharingStatus;
  invitationToken: string;
  emailSentSuccessfully: boolean;
  invitedAt: Date;
  respondedAt?: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
