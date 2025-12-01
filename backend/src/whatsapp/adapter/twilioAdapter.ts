
import twilio from 'twilio';

export interface ProviderResult {
  success: boolean;
  sid?: string;
  error?: string;
}

export interface ProviderWebhook {
  messageSid: string;
  status: string; // 'sent', 'delivered', 'read', 'failed'
  from: string;
  to: string;
  errorCode?: string;
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., 'whatsapp:+14155238886'

let client: twilio.Twilio | null = null;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
} else {
  console.warn('Twilio credentials missing. WhatsApp adapter will fail if used.');
}

export async function sendMessage(
  clientPhone: string,
  templateBody: string, // For Sandbox, we use body text. For Prod, this would be template params.
  _templateParams?: Record<string, string>
): Promise<ProviderResult> {
  if (!client) {
    return { success: false, error: 'Twilio client not initialized' };
  }

  try {
    const message = await client.messages.create({
      body: templateBody,
      from: fromNumber,
      to: `whatsapp:${clientPhone}`,
      statusCallback: `${process.env.PUBLIC_URL || 'http://localhost:3001'}/api/whatsapp/webhook`
    });

    return { success: true, sid: message.sid };
  } catch (error: any) {
    console.error('Twilio Send Error:', error.message);
    return { success: false, error: error.message };
  }
}

export function parseWebhook(reqBody: any): ProviderWebhook {
  // Twilio sends form-urlencoded data
  return {
    messageSid: reqBody.MessageSid,
    status: reqBody.MessageStatus,
    from: reqBody.From,
    to: reqBody.To,
    errorCode: reqBody.ErrorCode
  };
}
