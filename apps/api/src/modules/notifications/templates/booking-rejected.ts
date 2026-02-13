export function bookingRejectedTemplate(args: {
  hostelName: string;
  reason?: string;
}) {
  const reasonHtml = args.reason
    ? `<p style="margin:10px 0 0"><b>Reason:</b> ${args.reason}</p>`
    : "";

  return `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
    <h2 style="margin:0 0 12px">Booking rejected</h2>
    <p style="margin:0 0 10px">
      Your booking request for <b>${args.hostelName}</b> was rejected.
    </p>
    ${reasonHtml}
    <p style="margin:14px 0 0">
      You can try a different room type or another hostel.
    </p>
  </div>
  `;
}
