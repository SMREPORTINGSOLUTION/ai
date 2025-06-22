interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailData) {
  // Using a mock email service - replace with your preferred email provider
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, subject, html }),
    })

    return response.ok
  } catch (error) {
    console.error("Email sending failed:", error)
    return false
  }
}

export function generateWinnerEmail(name: string, position: number) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Congratulations!</h1>
      </div>
      <div style="padding: 40px; background: white;">
        <h2 style="color: #333;">Dear ${name},</h2>
        <p style="font-size: 18px; line-height: 1.6; color: #555;">
          We're thrilled to inform you that you've won <strong>Position #${position}</strong> in today's iPhone 15 contest!
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #28a745; margin: 0;">Your Prize: iPhone 15 🎁</h3>
          <p style="color: #666; margin: 10px 0 0 0;">Worth ₹80,000+</p>
        </div>
        <p style="color: #555;">
          Your ₹10 investment has paid off big time! Our team will contact you within 24 hours with delivery details.
        </p>
        <p style="color: #555;">
          Thank you for participating!
        </p>
      </div>
    </div>
  `
}

export function generatePaidEntryConfirmationEmail(name: string, paymentId: string, amount: number) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Payment Successful! 💳</h1>
      </div>
      <div style="padding: 40px; background: white;">
        <h2 style="color: #333;">Dear ${name},</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          Your payment of <strong>₹${amount}</strong> has been successfully processed and your entry for today's iPhone 15 contest has been confirmed!
        </p>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #28a745; margin: 0 0 10px 0;">Payment Details</h3>
          <p style="margin: 5px 0; color: #333;"><strong>Amount:</strong> ₹${amount}</p>
          <p style="margin: 5px 0; color: #333;"><strong>Payment ID:</strong> ${paymentId}</p>
          <p style="margin: 5px 0; color: #333;"><strong>Status:</strong> Completed ✅</p>
        </div>

        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #1976d2;">
            <strong>Contest Details:</strong><br>
            • 100 iPhone 15 devices to be won daily<br>
            • Winners announced at 11:59 PM<br>
            • Results sent via email<br>
            • Free worldwide shipping for winners
          </p>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0; color: #856404;">
            <strong>Your Winning Odds:</strong> With just ₹10, you have a chance to win an iPhone 15 worth ₹80,000+!
          </p>
        </div>
        
        <p style="color: #555;">
          Good luck! 🍀
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #888;">
            Keep this email as proof of payment. For any queries, contact our support team.
          </p>
        </div>
      </div>
    </div>
  `
}

export function generateEntryConfirmationEmail(name: string) {
  return generatePaidEntryConfirmationEmail(name, "FREE_ENTRY", 0)
}
