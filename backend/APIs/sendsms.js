const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

async function sendSmsToLeader(phoneNumber, message) {
  try {
    const response = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: phoneNumber,
    });

    console.log('📱 SMS sent:', response.sid);
    return true;
  } catch (err) {
    console.error('❌ SMS failed:', err.message);
    return false;
  }
}

module.exports = { sendSmsToLeader };
