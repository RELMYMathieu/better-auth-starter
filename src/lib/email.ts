import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async (payload: {
  to: string;
  subject: string;
  text: string;
}) => {
  try {
    const response = await resend.emails.send({
      from: "Zexa Technologies <onboarding@resend.dev>",
      ...payload,
    });

    if (response?.data) return true;
    return false;
  } catch (error: any) {
    console.error("Error sending email:", error);
    return false;
  }
};
