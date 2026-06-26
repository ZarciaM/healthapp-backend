function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function invitationEmailTemplate(params: {
  inviterFirstName: string;
  scope: string;
  token: string;
  acceptUrl: string;
}): string {
  const name = escapeHtml(params.inviterFirstName);
  const scopeLabel = params.scope === "menstrual_cycle" ? "menstrual cycle" : params.scope;
  const acceptLink = `${params.acceptUrl}?token=${encodeURIComponent(params.token)}`;
  const declineLink = `${params.acceptUrl}/decline?token=${encodeURIComponent(params.token)}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background-color: #4f46e5; padding: 24px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Data Sharing Invitation</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 16px; color: #333333;">Hello,</p>
              <p style="font-size: 16px; color: #333333;">
                <strong>${name}</strong> has invited you to view their <strong>${scopeLabel}</strong> data on HealthApp.
              </p>
              <p style="font-size: 16px; color: #333333;">
                By accepting, you will be able to view their health data directly from your account.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${acceptLink}" style="display: inline-block; padding: 14px 32px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">Accept Invitation</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="${declineLink}" style="color: #777777; font-size: 14px; text-decoration: underline;">Decline</a>
                  </td>
                </tr>
              </table>
              <p style="font-size: 14px; color: #777777; margin-top: 16px;">
                If you were not expecting this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f4; padding: 16px 32px; text-align: center; font-size: 12px; color: #999999;">
              HealthApp &mdash; Your health companion
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function invitationAcceptedEmailTemplate(params: {
  partnerFirstName: string;
  scope: string;
}): string {
  const name = escapeHtml(params.partnerFirstName);
  const scopeLabel = params.scope === "menstrual_cycle" ? "menstrual cycle" : params.scope;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background-color: #4f46e5; padding: 24px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Invitation Accepted</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 16px; color: #333333;">Hello,</p>
              <p style="font-size: 16px; color: #333333;">
                <strong>${name}</strong> has accepted your invitation to view your <strong>${scopeLabel}</strong> data.
              </p>
              <p style="font-size: 16px; color: #333333;">
                They now have access to this information from their account. You can revoke this access at any time from your sharing settings.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f4; padding: 16px 32px; text-align: center; font-size: 12px; color: #999999;">
              HealthApp &mdash; Your health companion
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function invitationRevokedEmailTemplate(params: {
  scope: string;
}): string {
  const scopeLabel = params.scope === "menstrual_cycle" ? "menstrual cycle" : params.scope;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background-color: #4f46e5; padding: 24px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Access Revoked</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 16px; color: #333333;">Hello,</p>
              <p style="font-size: 16px; color: #333333;">
                Your access to view <strong>${scopeLabel}</strong> data has been revoked by the data owner.
              </p>
              <p style="font-size: 16px; color: #333333;">
                You will no longer be able to view this information from your account.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f4; padding: 16px 32px; text-align: center; font-size: 12px; color: #999999;">
              HealthApp &mdash; Your health companion
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
