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
      const isTarget = now.format("YYYY-MM-DD") === "2026-05-12";

      if (!isTarget) {
        return res.status(200).send("Not today");
      }
    }

    const id = crypto
      .createHash("sha256")
      .update("birthday-2026-05-12")
      .digest("hex");

    const message = isTest
      ? "INI TEST YA 😄"
      : `Selamat ulang tahun, istriku cintaku 💖🎉

Tepat di jam 00:00 ini ⏰, aku ingin jadi orang pertama yang mengucapkan...

Selamat ulang tahun untuk perempuan paling istimewa dalam hidupku ❤️✨

Hari ini bukan cuma tentang bertambahnya usia kamu 🎂,
tapi tentang betapa bersyukurnya aku karena dunia menghadirkan kamu untukku 🌍💕

Terima kasih sudah hadir dalam hidupku 🤍,
terima kasih untuk setiap senyum yang kamu kasih 😊,
untuk setiap perhatian kecil yang selalu kamu tunjukkan 💫,
dan untuk semua cinta yang kamu berikan tanpa pernah berkurang sedikit pun ❤️

Kamu adalah rumah bagiku 🏡,
tempat aku pulang saat dunia terasa lelah 😔,
tempat aku menemukan tenang, hangat, dan bahagia ☁️✨

Aku mungkin bukan orang yang sempurna,
tapi satu hal yang pasti…
aku akan selalu berusaha jadi yang terbaik untuk kamu 💪❤️

Di umur kamu yang baru ini 🎈,
aku berharap semua impian kamu perlahan jadi nyata 🌠,
semoga kamu selalu sehat 💪,
selalu bahagia 😊,
dan selalu dikelilingi hal-hal baik 🌸

Dan kalau suatu hari kamu merasa lelah 😢,
ingat ya…
aku selalu ada di sini untuk kamu 🤗💖

Aku mencintaimu 💕,
bukan hanya hari ini,
tapi setiap hari, setiap waktu, tanpa henti ⏳❤️

Maaf jika di hari ulang tahun mu
di tahun sebelumnya aku tidak bisa
memberi hadiah 🥲

Selamat ulang tahun, sayangku…
Aku akan selalu memilih kamu, lagi dan lagi 💍❤️✨`;

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
      subject: isTest ? "TEST EMAIL" : "HBD MY WIFE ❤️✨",
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

    console.log("Email Sent:", emailRes.response);

    return res.status(200).send("Success");
  } catch (err) {
    console.error("ERROR:", err.response?.data || err.message);
    return res.status(500).send("Error");
  }
}
