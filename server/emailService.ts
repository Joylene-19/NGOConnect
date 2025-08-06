import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getSMTPConfig() {
    return {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    };
  }

  private getTransporter() {
    if (!this.transporter) {
      const config = this.getSMTPConfig();
      this.transporter = nodemailer.createTransport(config);
    }
    return this.transporter;
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const config = this.getSMTPConfig();
      
      // Validate email configuration
      if (!config.auth.user || config.auth.user === 'your-email@gmail.com') {
        console.error('❌ Email not configured. Please set EMAIL_USER in .env file');
        return false;
      }
      
      if (!config.auth.pass || config.auth.pass === 'your-app-password') {
        console.error('❌ Email password not configured. Please set EMAIL_PASS in .env file');
        return false;
      }

      // Validate recipient email
      if (!to || !to.includes('@')) {
        console.error('❌ Invalid recipient email:', to);
        return false;
      }

      console.log(`📧 Sending email to: ${to}`);
      console.log(`📨 Subject: ${subject}`);
      console.log(`🔐 From: ${config.auth.user}`);

      const mailOptions = {
        from: `NGOConnect Platform <${config.auth.user}>`,
        to,
        subject,
        html
      };

      const transporter = this.getTransporter();
      const result = await transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  async sendPasswordReset(email: string, resetToken: string, resetLink: string): Promise<boolean> {
    const subject = 'Reset Your NGOConnect Password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your NGOConnect account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        <p>If the button doesn't work, copy and paste this link:</p>
        <p>${resetLink}</p>
        <p>This link will expire in 10 minutes for security reasons.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p>Best regards,<br>The NGOConnect Team</p>
      </div>
    `;

    return this.sendEmail(email, subject, html);
  }
}

export const emailService = new EmailService();
