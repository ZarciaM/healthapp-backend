function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function hydrationReminderEmailTemplate(params: {
  firstName: string;
}): string {
  const firstName = escapeHtml(params.firstName);

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
            <td style="background-color: #06b6d4; padding: 24px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Hydration Reminder</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 16px; color: #333333;">Hello <strong>${firstName}</strong>,</p>
              <p style="font-size: 16px; color: #333333;">
                This is a friendly reminder to drink some water:
              </p>
              <p style="font-size: 18px; color: #06b6d4; font-weight: bold; text-align: center; padding: 16px; background-color: #f0fdff; border-radius: 6px;">
                💧 Stay hydrated!
              </p>
              <p style="font-size: 16px; color: #333333;">
                Keep a glass of water nearby and take a sip. Your body will thank you.
              </p>
              <p style="font-size: 14px; color: #777777; margin-top: 24px;">
                Staying hydrated helps maintain energy, focus, and overall well-being.
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
