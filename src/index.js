export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/contact") {
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  if (!env.DISCORD_WEBHOOK) {
    return new Response("contact unavailable", { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const { name, email, discord, subject, message } = body;

  if (!name || !email || !subject || !message) {
    return new Response("missing required fields", { status: 400 });
  }

  const now = new Date();
  const timestamp = now.toLocaleString("en-US", {
    month: "numeric", day: "numeric", year: "2-digit",
    hour: "numeric", minute: "2-digit", hour12: true,
  });

  const payload = {
    content: "@everyone",
    embeds: [{
      title: "📢 New Contact Form Submission",
      color: 0xd58ef5,
      fields: [
        { name: "🧑 Name", value: name, inline: true },
        { name: "📧 Email", value: email, inline: true },
        { name: "💬 Discord", value: discord || "not provided", inline: true },
        { name: "📝 Subject", value: subject },
        { name: "✉️ Message", value: message },
      ],
      footer: { text: `jos.gg Contact Form • ${timestamp}` },
    }],
  };

  const discordRes = await fetch(env.DISCORD_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!discordRes.ok) {
    return new Response("failed to send", { status: 502 });
  }

  return new Response("ok", { status: 200 });
}
