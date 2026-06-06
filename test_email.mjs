import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'priyanshug863@gmail.com',
    pass: 'ssbjhrvoolonukue',
  },
});

async function main() {
  try {
    const info = await transporter.sendMail({
      from: '"IndiThread Returns" <priyanshug863@gmail.com>',
      to: 'priyanshug863@gmail.com',
      subject: 'Test Email Verification',
      text: 'If you receive this, the SMTP configuration is working perfectly!',
    });
    console.log('Message sent: %s', info.messageId);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}
main();
