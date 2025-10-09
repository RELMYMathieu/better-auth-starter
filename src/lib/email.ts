import { Resend } from "resend";

let resend: Resend | null = null;

function getResendClient() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export const sendEmail = async (payload: {
  to: string;
  subject: string;
  text: string;
}) => {
  try {
    const client = getResendClient();
    const response = await client.emails.send({
      from: "Unicol Administration <noreply@mail.unicol.me>",
      ...payload,
    });

    if (response?.data) return true;
    return false;
  } catch (error: any) {
    console.error("Error sending email:", error);
    return false;
  }
};
