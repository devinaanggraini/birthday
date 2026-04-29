import axios from "axios";
import moment from "moment-timezone";
import nodemailer from "nodemailer";
import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const isTest = req.query.test === "true";

    // hanya izinkan cron ATAU test
    const isExternal = req.headers["user-agent"]?.includes("cron-job");

    if (!req.headers["x-vercel-cron"] && !isTest && !isExternal) {
      return res.status(403).send("Forbidden");
    }

    const now = moment().tz("Asia/Jakarta");

    // cek tanggal hanya kalau bukan test
    if (!isTest) {
      const isTarget = now.format("YYYY-MM-DD") === "2026-04-29";

      if (!isTarget) {
        return res.status(200).send("Not today");
      }
    }

    const id = crypto
      .createHash("sha256")
      .update("birthday-2026-04-29")
      .digest("hex");

    const message = isTest
      ? "INI TEST YA 😄"
      : /** `Selamat ulang tahun, cintaku 💖

Tepat jam 00:00 ini aku ingin jadi orang pertama yang mengucapkan...

Kamu adalah segalanya bagiku ❤️` **/ `TESTED`;

    console.log("Kirim pesan:", message);

    // ======================
    // WHATSAPP
    // ======================
    const waRes = await axios.post(
      "https://api.fonnte.com/send",
      {
        target: process.env.WA_TARGET,
        message: message
      },
      {
        headers: {
          Authorization: process.env.FONNTE_API_KEY
        }
      }
    );

    console.log("WA Response:", waRes.data);

    // ======================
    // EMAIL
    // ======================
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const emailRes = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: isTest ? "TEST EMAIL" : "TESTED",
      /** html: `
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
` **/
      text: message
    });

    console.log("Email Sent:", emailRes.response);

    return res.status(200).send("Success");
  } catch (err) {
    console.error("ERROR:", err.response?.data || err.message);
    return res.status(500).send("Error");
  }
}
