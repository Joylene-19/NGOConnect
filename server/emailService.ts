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

  async sendCertificateNotification(
    email: string, 
    volunteerName: string, 
    taskTitle: string, 
    ngoName: string, 
    certificateUrl: string
  ): Promise<boolean> {
    const subject = `Certificate Available: ${taskTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>🏆 Certificate Available!</h2>
        <p>Hello ${volunteerName},</p>
        <p>Congratulations! Your certificate for completing the volunteer task <strong>"${taskTitle}"</strong> with ${ngoName} is now ready.</p>
        
        <div style="background: #f0f9ff; padding: 15px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Certificate Details:</h3>
          <p style="margin: 5px 0;"><strong>Task:</strong> ${taskTitle}</p>
          <p style="margin: 5px 0;"><strong>Organization:</strong> ${ngoName}</p>
          <p style="margin: 5px 0;"><strong>Volunteer:</strong> ${volunteerName}</p>
        </div>
        
        <p>You can download your certificate by logging into your NGOConnect dashboard and visiting the Certificates section, or by accessing the direct link below:</p>
        
        <a href="${certificateUrl}" style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0;">Download Certificate</a>
        
        <p>Thank you for your valuable contribution to the community!</p>
        
        <p>Best regards,<br>The NGOConnect Team</p>
      </div>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendApplicationNotification(
    ngoEmail: string,
    ngoName: string,
    volunteerName: string,
    taskTitle: string,
    motivation: string
  ): Promise<boolean> {
    const subject = `New Application: ${volunteerName} for ${taskTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>New Volunteer Application</h2>
        <p>Hello ${ngoName},</p>
        <p>You have received a new application for your volunteer task <strong>"${taskTitle}"</strong>.</p>
        
        <div style="background: #f0f9ff; padding: 15px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Application Details:</h3>
          <p style="margin: 5px 0;"><strong>Volunteer:</strong> ${volunteerName}</p>
          <p style="margin: 5px 0;"><strong>Task:</strong> ${taskTitle}</p>
          <p style="margin: 5px 0;"><strong>Motivation:</strong> ${motivation}</p>
        </div>
        
        <p>Please log into your NGOConnect dashboard to review and respond to this application.</p>
        
        <p>Best regards,<br>The NGOConnect Team</p>
      </div>
    `;

    return this.sendEmail(ngoEmail, subject, html);
  }

  async sendApplicationStatusNotification(
    email: string, 
    volunteerName: string, 
    taskTitle: string, 
    ngoName: string,
    status: string
  ): Promise<boolean> {
    const subject = `Application ${status}: ${taskTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Application Update</h2>
        <p>Hello ${volunteerName},</p>
        <p>Your application for the task <strong>"${taskTitle}"</strong> with ${ngoName} has been <strong>${status}</strong>.</p>
        
        ${status === 'approved' ? `
          <div style="background: #f0f9ff; padding: 15px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
            <p style="margin: 0;"><strong>Congratulations!</strong> You've been approved for this volunteer opportunity.</p>
          </div>
        ` : `
          <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <p style="margin: 0;">Unfortunately, your application was not approved this time.</p>
          </div>
        `}
        
        <p>Thank you for your interest in volunteering!</p>
        <p>Best regards,<br>The NGOConnect Team</p>
      </div>
    `;

    return this.sendEmail(email, subject, html);
  }
}

export const emailService = new EmailService();
