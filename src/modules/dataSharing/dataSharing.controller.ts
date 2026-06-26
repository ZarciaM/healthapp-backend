import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import type { IDataShare, SanitizedShare } from "./dataSharing.types.js";
import * as dataSharingService from "./dataSharing.service.js";

function sanitizeShare(share: IDataShare): SanitizedShare {
  const { invitationToken: _, ...rest } = share;
  return rest;
}

function sanitizeShares(shares: IDataShare[]): SanitizedShare[] {
  return shares.map(sanitizeShare);
}

export const create = asyncHandler(async (req: Request, res: Response) => {
  const share = await dataSharingService.createInvitation(
    req.user!.userId,
    req.body.partnerEmail,
    req.body.scope,
  );

  const message = share.emailSentSuccessfully
    ? "Invitation sent"
    : "Invitation created but the email could not be sent. You can resend it.";

  sendSuccess(res, 201, message, { share: sanitizeShare(share) });
});

export const accept = asyncHandler(async (req: Request, res: Response) => {
  const share = await dataSharingService.acceptInvitation(
    req.body.invitationToken,
    req.user!.userId,
  );

  sendSuccess(res, 200, "Invitation accepted", { share: sanitizeShare(share) });
});

export const decline = asyncHandler(async (req: Request, res: Response) => {
  await dataSharingService.declineInvitation(req.body.invitationToken, req.user!.userId);

  sendSuccess(res, 200, "Invitation declined");
});

export const resend = asyncHandler(async (req: Request, res: Response) => {
  const result = await dataSharingService.resendInvitation(req.user!.userId, req.params.id as string);

  const message = result.emailSentSuccessfully
    ? "Invitation email resent successfully"
    : "Failed to resend invitation email";

  sendSuccess(res, 200, message, { emailSentSuccessfully: result.emailSentSuccessfully });
});

export const revoke = asyncHandler(async (req: Request, res: Response) => {
  await dataSharingService.revokeShare(req.user!.userId, req.params.id as string);

  sendSuccess(res, 200, "Access revoked");
});

export const getSharesAsOwner = asyncHandler(async (req: Request, res: Response) => {
  const shares = await dataSharingService.getActiveSharesAsOwner(req.user!.userId);

  sendSuccess(res, 200, "Active shares retrieved", { shares: sanitizeShares(shares) });
});

export const getSharesAsPartner = asyncHandler(async (req: Request, res: Response) => {
  const shares = await dataSharingService.getActiveSharesAsPartner(req.user!.userId);

  sendSuccess(res, 200, "Active shared access retrieved", { shares: sanitizeShares(shares) });
});
