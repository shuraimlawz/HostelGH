export function broadcastTemplate(args: {
    title: string;
    message: string;
    type: string;
}) {
    const typeColors = {
        info: { bg: '#EFF6FF', border: '#3B82F6', icon: 'ℹ️' },
        warning: { bg: '#FEF3C7', border: '#F59E0B', icon: '⚠️' },
        alert: { bg: '#FEE2E2', border: '#EF4444', icon: '🚨' },
    };

    const colors = typeColors[args.type as keyof typeof typeColors] || typeColors.info;

    return `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:600px;margin:0 auto">
    <div style="background:${colors.bg};border-left:4px solid ${colors.border};padding:20px;border-radius:12px;margin-bottom:20px">
      <h2 style="margin:0 0 12px;display:flex;align-items:center;gap:8px">
        <span>${colors.icon}</span>
        ${args.title}
      </h2>
      <p style="margin:0;white-space:pre-wrap">${args.message}</p>
    </div>
    <div style="padding:16px;background:#f9fafb;border-radius:8px;text-align:center">
      <p style="margin:0;font-size:12px;color:#6b7280">
        This is a broadcast message from HostelGH Administration
      </p>
    </div>
  </div>
  `;
}
