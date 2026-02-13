export function bookingApprovedTemplate(args: {
  hostelName: string;
  startDate: string;
  endDate: string;
}) {
  return `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
    <h2 style="margin:0 0 12px">Booking approved ✅</h2>
    <p style="margin:0 0 10px">
      Your booking for <b>${args.hostelName}</b> has been approved.
    </p>
    <div style="padding:12px;border:1px solid #eee;border-radius:12px;background:#fafafa">
      <p style="margin:0"><b>Dates:</b> ${args.startDate} → ${args.endDate}</p>
    </div>
    <p style="margin:14px 0 0">
      You can now proceed to payment in your dashboard.
    </p>
  </div>
  `;
}
