export function paymentConfirmedTemplate(args: {
  hostelName: string;
  amount: string;
  reference: string;
}) {
  return `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
    <h2 style="margin:0 0 12px">Payment confirmed 🎉</h2>
    <p style="margin:0 0 10px">
      Your payment for <b>${args.hostelName}</b> has been confirmed.
    </p>
    <div style="padding:12px;border:1px solid #eee;border-radius:12px;background:#fafafa">
      <p style="margin:0"><b>Amount:</b> ${args.amount}</p>
      <p style="margin:6px 0 0"><b>Reference:</b> ${args.reference}</p>
    </div>
  </div>
  `;
}
