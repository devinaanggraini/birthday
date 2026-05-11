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

Tepat di Tanggal 12 Mei 2026 jam 00:00 ini ⏰, aku ingin jadi orang pertama yang mengucapkan...

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
Aku akan selalu memilih kamu, lagi dan lagi 💍❤️✨

Klik link dibawah ya cantiiii 😚

https://bit.ly/hbd-canticuuu`;

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
<div style="margin:0;padding:0;background:#fff0f6;font-family: 'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" 
          style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#ff6fa5,#ffb6c1);padding:30px;text-align:center;color:white;">
              <h1 style="margin:0;font-size:28px;">Selamat Ulang Tahun 💖</h1>
              <p style="margin:5px 0 0;font-size:16px;">Untuk Istriku Tercinta</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:30px;color:#444;line-height:1.7;font-size:16px;">

              <p>Sayangku ❤️</p>

              <p>
                Tepat di jam <b>00:00</b> ini, aku ingin jadi orang pertama yang mengucapkan...
                <br><br>
                <b>Selamat ulang tahun untuk perempuan paling istimewa dalam hidupku.</b>
              </p>

              <p>
                Hari ini bukan hanya tentang bertambahnya usia kamu,
                tapi tentang betapa bersyukurnya aku karena dunia mempertemukan aku dengan kamu.
              </p>

              <p>
                Terima kasih sudah menjadi bagian terindah dalam hidupku,
                untuk semua cinta, perhatian, dan kesabaran yang kamu berikan.
              </p>

              <p>
                Kamu adalah rumah bagiku,
                tempat aku pulang,
                tempat aku merasa tenang,
                dan tempat aku menemukan kebahagiaan.
              </p>

              <p>
                Di umur kamu yang baru ini,
                aku berdoa semoga kamu selalu sehat,
                selalu bahagia,
                dan semua impian kamu satu per satu menjadi nyata.
              </p>

              <p>
                Dan apapun yang terjadi nanti,
                aku akan selalu ada di samping kamu.
              </p>

              <p style="font-size:18px;color:#e91e63;font-weight:bold;">
                Aku mencintaimu, hari ini, besok, dan selamanya 💕
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#fff0f6;padding:20px;text-align:center;font-size:14px;color:#888;">
              ❤️ Dari suamimu yang selalu mencintaimu ❤️
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
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
