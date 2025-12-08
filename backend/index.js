import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message, company } = req.body;

    console.log("Incoming contact form:", req.body);

    if (company && company.trim() !== "") {
      return res.status(400).json({ message: "Spam detected" });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const emailresponse = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: process.env.CONTACT_TO_EMAIL,
      replyTo:email,
      subject: `New message from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });
    console.log(emailresponse);
    
    return res.json({ message: "Message sent successfully!" });

  } catch (err) {
    console.error("Contact Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Server running on port", PORT));
