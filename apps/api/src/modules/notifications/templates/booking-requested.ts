export function bookingRequestedTemplate(args: {
  tenantName: string;
  hostelName: string;
  startDate: string;
  endDate: string;
}) {
  return `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
    <h2 style="margin:0 0 12px">New booking request</h2>
    <p style="margin:0 0 10px">
      You have a new booking request for <b>${args.hostelName}</b>.
    </p>
    <div style="padding:12px;border:1px solid #eee;border-radius:12px;background:#fafafa">
      <p style="margin:0"><b>Tenant:</b> ${args.tenantName}</p>
      <p style="margin:6px 0 0"><b>Dates:</b> ${args.startDate} → ${args.endDate}</p>
    </div>
    <p style="margin:14px 0 0">
      Please log in to approve or reject this booking.
    </p>
  </div>
  `;
}
