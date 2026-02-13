# BukuHutang Worker Skill

## Description
Worker agent for sending BukuHutang WhatsApp reminders via OpenClaw orchestration.

## Usage

### Send Reminder
```javascript
const job = {
  type: 'SEND_REMINDER',
  debtId: 123,
  debtorPhone: '08123456789',
  debtorName: 'Budi',
  amount: 500000,
  description: 'Beli semen',
  ownerPhone: '08198765432'
};

// 1. Send reminder to debtor
await sendWhatsApp(job.debtorPhone, 
  `Halo ${job.debtorName}, ini pengingat pembayaran Rp ${job.amount}. ` +
  `Mohon konfirmasi jika sudah membayar. Terima kasih!`
);

// 2. Notify owner
await sendWhatsApp(job.ownerPhone,
  `✅ Reminder terkirim ke ${job.debtorName} (Rp ${job.amount})`
);

// 3. Report back to BukuHutang API
await fetch('http://localhost:3000/api/openclaw/report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jobType: 'REMINDER_SENT',
    jobId: job.debtId,
    status: 'success',
    metadata: { sentAt: new Date().toISOString() }
  })
});
```

### Error Handling
- If WA send fails, throw error (OpenClaw auto-retry)
- Max 3 retries with exponential backoff
- Report failure to API if all retries exhausted
