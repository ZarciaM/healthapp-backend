import { z } from "zod";

export const createInvitationSchema = z.object({
  partnerEmail: z
    .string()
    .email("partnerEmail must be a valid email address"),
  scope: z
    .enum(["menstrual_cycle"], {
      message: "scope must be 'menstrual_cycle'",
    }),
});

export const respondInvitationSchema = z.object({
  invitationToken: z
    .string()
    .trim()
    .min(1, "invitationToken is required"),
});
