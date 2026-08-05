import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import transporter from '../config/nodemailer.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.resolve(__dirname, '..', 'emails', 'templates');

/**
 * Loads an HTML email template and replaces placeholders.
 *
 * @param {string} templateName - Template filename (without extension)
 * @param {object} replacements - Key-value pairs for placeholder replacement
 * @returns {string} Processed HTML string
 */
const loadTemplate = (templateName, replacements = {}) => {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf8');

  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, value);
  }

  return html;
};

/**
 * Sends an email using the configured SMTP transporter.
 *
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.html] - HTML body
 * @param {string} [options.template] - Template name (loads from templates dir)
 * @param {object} [options.replacements] - Template placeholder replacements
 * @returns {Promise<object>} Nodemailer send result
 */
export const sendEmail = async ({ to, subject, text, html, template, replacements }) => {
  try {
    let htmlContent = html;

    // Load template if specified
    if (template) {
      htmlContent = loadTemplate(template, replacements);
    }

    const mailOptions = {
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to,
      subject,
      text: text || undefined,
      html: htmlContent || undefined,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`📧 Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
};

/**
 * Sends a password reset email.
 *
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} resetUrl - Password reset URL
 */
export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  await sendEmail({
    to: email,
    subject: 'Password Reset Request — Agency CMS',
    template: 'resetPassword',
    replacements: {
      name,
      resetUrl,
      year: new Date().getFullYear().toString(),
    },
  });
};

/**
 * Sends a welcome email to a new user.
 *
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} loginUrl - Login URL
 */
export const sendWelcomeEmail = async (email, name, loginUrl) => {
  await sendEmail({
    to: email,
    subject: 'Welcome to Agency CMS',
    template: 'welcomeEmail',
    replacements: {
      name,
      loginUrl,
      year: new Date().getFullYear().toString(),
    },
  });
};
