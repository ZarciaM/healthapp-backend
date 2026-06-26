import crypto from "node:crypto";
import { Types } from "mongoose";
import DataShare from "./dataSharing.model.js";
import type { IDataShare, SharingScope, SharingStatus } from "./dataSharing.types.js";
import { ApiError } from "../../utils/ApiError.js";
import logger from "../../utils/logger.js";
import { sendEmail } from "../notifications/email.service.js";
import User from "../user/user.model.js";
import {
  invitationEmailTemplate,
  invitationAcceptedEmailTemplate,
  invitationRevokedEmailTemplate,
} from "./templates/invitationEmail.template.js";

function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createInvitation(
  ownerId: string,
  partnerEmail: string,
  scope: SharingScope,
): Promise<IDataShare> {
  const normalizedEmail = partnerEmail.toLowerCase().trim();

  const owner = await User.findById(ownerId).select("firstName lastName email").lean();
  if (!owner) {
    throw ApiError.notFound("Owner not found");
  }

  if (owner.email.toLowerCase() === normalizedEmail) {
    throw ApiError.badRequest("You cannot invite yourself");
  }

  const invitationToken = generateInvitationToken();

  let shareDoc;
  try {
    shareDoc = await DataShare.create({
      ownerId: new Types.ObjectId(ownerId),
      partnerEmail: normalizedEmail,
      scope,
      status: "pending",
      invitationToken,
      emailSentSuccessfully: false,
    });
  } catch (err: unknown) {
    if ((err as Record<string, unknown>)?.code === 11000) {
      throw ApiError.conflict("An active invitation already exists for this email and scope");
    }
    throw err;
  }

  const acceptUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/sharing/accept`;

  const emailResult = await sendEmail({
    to: normalizedEmail,
    subject: `${owner.firstName} ${owner.lastName} has invited you to view their health data`,
    html: invitationEmailTemplate({
      inviterFirstName: owner.firstName,
      scope,
      token: invitationToken,
      acceptUrl,
    }),
  });

  if (emailResult.success) {
    await DataShare.findByIdAndUpdate(shareDoc._id, { $set: { emailSentSuccessfully: true } });
  } else {
    logger.error(`Failed to send invitation email for share ${shareDoc._id}`);
  }

  return (await DataShare.findById(shareDoc._id).lean())!;
}

export async function resendInvitation(
  ownerId: string,
  shareId: string,
): Promise<{ emailSentSuccessfully: boolean }> {
  const share = await DataShare.findById(shareId).lean();

  if (!share) {
    throw ApiError.notFound("Share not found");
  }

  if (share.ownerId.toString() !== ownerId) {
    throw ApiError.forbidden("You can only resend your own invitations");
  }

  if (share.status !== "pending") {
    throw ApiError.badRequest("Cannot resend an invitation that is no longer pending");
  }

  const owner = await User.findById(ownerId).select("firstName lastName email").lean();
  if (!owner) {
    throw ApiError.notFound("Owner not found");
  }

  const acceptUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/sharing/accept`;

  const emailResult = await sendEmail({
    to: share.partnerEmail,
    subject: `${owner.firstName} ${owner.lastName} has invited you to view their health data`,
    html: invitationEmailTemplate({
      inviterFirstName: owner.firstName,
      scope: share.scope,
      token: share.invitationToken,
      acceptUrl,
    }),
  });

  const emailSentSuccessfully = emailResult.success;

  await DataShare.findByIdAndUpdate(shareId, { $set: { emailSentSuccessfully } });

  if (!emailSentSuccessfully) {
    logger.error(`Failed to resend invitation email for share ${shareId}`);
  }

  return { emailSentSuccessfully };
}

export async function acceptInvitation(
  invitationToken: string,
  acceptingUserId: string,
): Promise<IDataShare> {
  const share = await DataShare.findOne({ invitationToken }).lean();

  if (!share) {
    throw ApiError.notFound("Invitation not found");
  }

  if (share.status !== "pending") {
    throw ApiError.badRequest(`This invitation has already been ${share.status}`);
  }

  const acceptingUser = await User.findById(acceptingUserId).select("email firstName").lean();
  if (!acceptingUser) {
    throw ApiError.notFound("User not found");
  }

  if (acceptingUser.email.toLowerCase() !== share.partnerEmail) {
    throw ApiError.forbidden("This invitation was sent to a different email address");
  }

  const updated = await DataShare.findOneAndUpdate(
    { _id: share._id, status: "pending" },
    {
      $set: {
        partnerId: new Types.ObjectId(acceptingUserId),
        status: "accepted" as SharingStatus,
        respondedAt: new Date(),
      },
    },
    { new: true },
  );

  if (!updated) {
    throw ApiError.conflict("This invitation has already been processed");
  }

  const owner = await User.findById(share.ownerId).select("email firstName").lean();
  if (owner) {
    const emailResult = await sendEmail({
      to: owner.email,
      subject: `${acceptingUser.firstName} has accepted your data sharing invitation`,
      html: invitationAcceptedEmailTemplate({
        partnerFirstName: acceptingUser.firstName,
        scope: share.scope,
      }),
    });

    if (!emailResult.success) {
      logger.error(`Failed to send acceptance notification for share ${share._id}`);
    }
  }

  return updated.toObject();
}

export async function declineInvitation(
  invitationToken: string,
  acceptingUserId: string,
): Promise<void> {
  const share = await DataShare.findOne({ invitationToken }).lean();

  if (!share) {
    throw ApiError.notFound("Invitation not found");
  }

  if (share.status !== "pending") {
    throw ApiError.badRequest(`This invitation has already been ${share.status}`);
  }

  const decliningUser = await User.findById(acceptingUserId).select("email").lean();
  if (!decliningUser) {
    throw ApiError.notFound("User not found");
  }

  if (decliningUser.email.toLowerCase() !== share.partnerEmail) {
    throw ApiError.forbidden("This invitation was sent to a different email address");
  }

  const updated = await DataShare.findOneAndUpdate(
    { _id: share._id, status: "pending" },
    { $set: { status: "declined" as SharingStatus, respondedAt: new Date() } },
    { new: true },
  );

  if (!updated) {
    throw ApiError.conflict("This invitation has already been processed");
  }
}

export async function revokeShare(ownerId: string, shareId: string): Promise<void> {
  const share = await DataShare.findById(shareId).lean();

  if (!share) {
    throw ApiError.notFound("Share not found");
  }

  if (share.ownerId.toString() !== ownerId) {
    throw ApiError.forbidden("You can only revoke shares that you created");
  }

  await DataShare.findByIdAndUpdate(shareId, {
    $set: {
      status: "revoked" as SharingStatus,
      revokedAt: new Date(),
    },
  });

  if (share.partnerId) {
    const partner = await User.findById(share.partnerId).select("email").lean();
    if (partner) {
      const emailResult = await sendEmail({
        to: partner.email,
        subject: "Data sharing access has been revoked",
        html: invitationRevokedEmailTemplate({ scope: share.scope }),
      });

      if (!emailResult.success) {
        logger.error(`Failed to send revocation email for share ${share._id}`);
      }
    }
  }
}

export async function getActiveSharesAsOwner(ownerId: string): Promise<IDataShare[]> {
  return DataShare.find({
    ownerId: new Types.ObjectId(ownerId),
    status: "accepted",
  })
    .populate("partnerId", "firstName lastName email")
    .sort({ createdAt: -1 })
    .lean();
}

export async function getActiveSharesAsPartner(partnerId: string): Promise<IDataShare[]> {
  return DataShare.find({
    partnerId: new Types.ObjectId(partnerId),
    status: "accepted",
  })
    .populate("ownerId", "firstName lastName email")
    .sort({ createdAt: -1 })
    .lean();
}

export async function hasActiveAccess(
  partnerId: string,
  ownerId: string,
  scope: SharingScope,
): Promise<boolean> {
  const share = await DataShare.findOne({
    ownerId: new Types.ObjectId(ownerId),
    partnerId: new Types.ObjectId(partnerId),
    scope,
    status: "accepted",
  }).lean();

  return !!share;
}
