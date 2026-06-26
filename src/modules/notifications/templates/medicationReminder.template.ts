function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function medicationReminderEmailTemplate(params: {
  firstName: string;
  medicationName: string;
  dosage?: string;
}): string {
  const firstName = escapeHtml(params.firstName);
  const medicationName = escapeHtml(params.medicationName);
  const dosageText = params.dosage ? ` (${escapeHtml(params.dosage)})` : "";

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
              <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Medication Reminder</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 16px; color: #333333;">Hello <strong>${firstName}</strong>,</p>
              <p style="font-size: 16px; color: #333333;">
                This is a friendly reminder to take your medication:
              </p>
              <p style="font-size: 18px; color: #4f46e5; font-weight: bold; text-align: center; padding: 16px; background-color: #f0f0ff; border-radius: 6px;">
                ${medicationName}${dosageText}
              </p>
              <p style="font-size: 16px; color: #333333;">
                Please take it as prescribed by your healthcare provider.
              </p>
              <p style="font-size: 14px; color: #777777; margin-top: 24px;">
                If you have any questions, consult your doctor or pharmacist.
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
