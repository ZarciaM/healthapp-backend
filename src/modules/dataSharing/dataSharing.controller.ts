import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import type { IDataShare } from "./dataSharing.types.js";
import * as dataSharingService from "./dataSharing.service.js";

function sanitizeShare(share: IDataShare): IDataShare {
  const sanitized = { ...share } as Record<string, unknown>;
  delete sanitized.invitationToken;
  return sanitized as unknown as IDataShare;
}

function sanitizeShares(shares: IDataShare[]): IDataShare[] {
  return shares.map(sanitizeShare);
}

export const create = asyncHandler(async (req: Request, res: Response) => {
  const share = await dataSharingService.createInvitation(
    req.user!.userId,
    req.body.partnerEmail,
    req.body.scope,
  );

  sendSuccess(res, 201, "Invitation sent", { share: sanitizeShare(share) });
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
