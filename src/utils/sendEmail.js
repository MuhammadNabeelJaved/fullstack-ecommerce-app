import dotenv from "dotenv"
import nodemailer from "nodemailer"

dotenv.config()

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

const currentDateTime = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
})


const sendEmail = async (email, subject, otp) => {
    try {
        const response = await resend.emails.send({
            from: "graphicsanimation786@gmail.com",
            to: email,
            subject: subject,
            html: `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    </style>
</head>
<body style="font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; line-height: 1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <tr>
            <td style="padding: 20px; text-align: center; background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); color: white;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Verify Your Account</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 30px 20px; text-align: center;">
                <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                    We received a request to verify your account. Enter the following One-Time Password (OTP):
                </p>
                
                <div style="background-color: #f0f0f0; display: inline-block; padding: 15px 25px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="font-size: 32px; color: #2575fc; margin: 0; letter-spacing: 10px;">
                        <!-- Dynamic OTP will be inserted here -->
                        ${otp}
                    </h2>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                    This OTP is valid for 10 minutes from the time of generation.
                </p>
                
                <p style="color: #666; font-size: 12px; margin-top: 10px;">
                    Generated on: <span id="current-date-time">
                        ${currentDateTime}
                    </span>
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f4f4f4; padding: 15px; text-align: center;">
                <p style="color: #888; font-size: 12px; margin: 0;">
                    If you didn't request this verification, please ignore this email or contact support.
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #333; color: white; padding: 10px; text-align: center;">
                <p style="margin: 0; font-size: 12px;">
                    © 2024 Your E-Commerce Store. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
            `
        })
        return response
    } catch (error) {
        throw new ApiError(500, error.message)
    }
}


export default sendEmail


