const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// Environment variables
const PAGE_TOKEN = process.env.PAGE_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

// GIF LINKS
const WELCOME_GIF = "https://pin.it/7p5d1cImP";
const LEAVE_GIF = "https://pin.it/69IVjTYmt";
const SLEEP_GIF = "https://pin.it/3NIWfz45O";
const GOOD_MORNING_GIF = "https://pin.it/QXf6wIxvu";

// ---------- Helper Functions ----------

// Send text message
async function sendMsg(user, text) {
  await axios.post(
    `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_TOKEN}`,
    { recipient: { id: user }, message: { text: text } }
  );
}

// Send GIF
async function sendGif(user, link) {
  await axios.post(
    `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_TOKEN}`,
    {
      recipient: { id: user },
      message: { attachment: { type: "image", payload: { url: link } } }
    }
  );
}

// Auto reaction (placeholder)
async function autoReact(mid) {
  // Facebook reactions API can be added here
}

// ---------- Webhook Verification ----------
app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ---------- Webhook Receiver ----------
app.post("/webhook", async (req, res) => {
  let body = req.body;

  if (body.object === "page") {
    body.entry.forEach(async (entry) => {
      let event = entry.messaging[0];
      let sender = event.sender.id;

      // Ignore messages from the bot itself
      if (sender === ADMIN_ID) return;

      // ---------- Auto reaction ----------
      if (event.message) {
        await autoReact(event.message.mid);
      }

      // ---------- Message Handling ----------
      if (event.message && event.message.text) {
        let msg = event.message.text.toLowerCase();

        // ---------- New Feature: Naruto Text ----------
        if (msg.includes("naruto")) {
          if (msg.endsWith("?") || msg.includes("?")) {
            await sendMsg(sender, `Naruto, আমি এখানে আছি 😎`);
          } else {
            await sendMsg(sender, "হেই! আমি এখানে আছি 😎");
          }
        }

        // ---------- Mention Welcome ----------
        if (msg.includes("@")) {
          await sendMsg(sender, "স্বাগতম! Naruto বটে এখানে 😄");
          await sendGif(sender, WELCOME_GIF);
        }

        // ---------- Leave ----------
        if (msg.includes("leave")) {
          await sendMsg(sender, "বিদায়! Naruto Group ছেড়ে গেল 😢");
          await sendGif(sender, LEAVE_GIF);
        }

        // ---------- Good Morning ----------
        if (msg.includes("good morning")) {
          await sendMsg(sender, "Good Morning! 🌅 Naruto আপনাকে শুভেচ্ছা জানাচ্ছে");
          await sendGif(sender, GOOD_MORNING_GIF);
        }

        // ---------- Sleep Mode ----------
        if (msg.includes("sleep")) {
          await sendMsg(sender, "Naruto এখন স্লিপ মোডে 😴");
          await sendGif(sender, SLEEP_GIF);
        }

        // ---------- Admin Info ----------
        if (msg.includes("admininfo")) {
          await sendMsg(sender, `Admin ID: ${ADMIN_ID}`);
          await sendGif(sender, WELCOME_GIF); // Same welcome GIF
        }

        // ---------- Kick Command ----------
        if (msg.startsWith("/kick")) {
          if (sender === ADMIN_ID) {
            await sendMsg(sender, "কমান্ড এক্সিকিউটেড: ইউজার গ্রুপ থেকে বের করা হলো ✅");
          } else {
            await sendMsg(sender, "দুঃখিত! শুধুমাত্র Admin এই কমান্ড ব্যবহার করতে পারবে ❌");
          }
        }
      }
    });
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// ---------- Server ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Naruto Uzumaki Bot running on port ${PORT}`));
