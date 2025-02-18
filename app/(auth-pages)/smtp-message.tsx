export function SmtpMessage() {
  if (process.env.SMTP_HOST) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 p-4">
      <p className="text-yellow-800 text-sm text-center">
        ⚠️ SMTP is not configured. Email notifications will not be sent.
      </p>
    </div>
  )
} 