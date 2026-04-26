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
  now.month() === 3 &&
  now.date() === 26;

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
      html: `
  <div style="font-family: Arial, sans-serif; background: #fff0f5; padding: 20px; border-radius: 10px;">
    <h2 style="color: #e91e63; text-align: center;">
      Selamat Ulang Tahun 💖
    </h2>

    <p style="font-size: 16px; color: #333;">
      Tepat di jam <b>00:00</b> ini, aku ingin jadi orang pertama yang mengucapkan...
    </p>

    <p style="font-size: 18px; font-weight: bold; color: #d81b60;">
      Selamat ulang tahun, istriku tercinta ❤️
    </p>

    <p style="font-size: 16px; color: #333;">
      Semoga di umur yang baru ini kamu selalu diberikan kebahagiaan,
      kesehatan, dan semua hal indah yang kamu impikan.
    </p>

    <p style="font-size: 16px; color: #333;">
      Terima kasih sudah menjadi bagian terindah dalam hidupku.
    </p>

    <p style="font-size: 18px; color: #e91e63;">
      Aku mencintaimu, hari ini dan selamanya 💕
    </p>

    <hr style="margin: 20px 0;" />

    <p style="text-align: center; font-size: 14px; color: #777;">
      ❤️ Dari suamimu ❤️
    </p>
  </div>
`
    });

    return res.status(200).send("Success: sent once");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error");
  }
      }
