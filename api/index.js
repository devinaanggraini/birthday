import axios from "axios";
import moment from "moment-timezone";
import nodemailer from "nodemailer";
import crypto from "crypto";

export default async function handler(req, res) {
  try {
    // hanya izinkan dari vercel cron
    if (!req.headers["x-vercel-cron"]) {
      return res.status(403).send("Forbidden");
    }

    const now = moment().tz("Asia/Jakarta");

const isTarget =
  now.year() === 2026 &&
  now.month() === 4 &&
  now.date() === 12;

if (!isTarget) {
  return res.status(200).send("Not today");
}

    // id unik (idempotency key)
    const id = crypto
      .createHash("sha256")
      .update("birthday-2026-05-12-00-00")
      .digest("hex");

    console.log("Execution ID:", id);

    const message = `Selamat ulang tahun, cintaku 💖

Tepat jam 00:00 ini aku ingin jadi orang pertama yang mengucapkan...

Kamu adalah segalanya bagiku ❤️`;

    // ======================
    // 1. WHATSAPP (Fonnte)
    // ======================
    await axios.post(
      "https://api.fonnte.com/send",
      {
        target: process.env.WA_TARGET,
        message: message
      },
      {
        headers: {
          Authorization: process.env.FONNTE_API_KEY,
          "Idempotency-Key": id
        }
      }
    );

    // ======================
    // 2. EMAIL
    // ======================
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: "Selamat Ulang Tahun ❤️",
      text: message
    });

    return res.status(200).send("Success: sent once");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error");
  }
      }
