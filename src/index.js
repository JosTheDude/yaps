const sitemapRoutes = ["/"];
const servers = [
  { name: "SoulRealms", address: "play.soulrealms.net" },
  { name: "RealmSMP", address: "play.realmsmp.net" },
  { name: "ForgottenSMP", address: "play.forgottensmp.net" },
  { name: "Hoplite", address: "play.hoplite.gg" },
  { name: "LeoneMC", address: "play.leonemc.net" },
  { name: "MineHeart", address: "play.mineheart.net" },
  { name: "ZedarMC", address: "play.zedarmc.com" },
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" || request.method === "HEAD") {
      if (url.pathname === "/sitemap.xml") {
        return handleSitemap(url);
      }

      if (url.pathname === "/robots.txt") {
        return handleRobots(url);
      }

      if (url.pathname === "/api/stats") {
        return handleStats();
      }
    }

    if (request.method === "POST" && url.pathname === "/api/contact") {
      return handleContact(request, env);
    }

    try {
      const response = await env.ASSETS.fetch(request);

      if (response.status === 404 && url.pathname !== "/") {
        return Response.redirect(`${url.origin}/`, 302);
      }

      return response;
    } catch (error) {
      if (url.pathname !== "/") {
        return Response.redirect(`${url.origin}/`, 302);
      }

      console.error("asset fetch failed", error);
      return new Response("internal error", { status: 500 });
    }
  },
};

function handleSitemap(url) {
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapRoutes.map((route) => `  <url><loc>${escapeXml(`${url.origin}${route}`)}</loc></url>`),
    "</urlset>",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function handleRobots(url) {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/contact",
    `Sitemap: ${url.origin}/sitemap.xml`,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=UTF-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

async function handleStats() {
  const now = Date.now();
  const results = await Promise.allSettled(servers.map(fetchServerStatus));
  const serverList = results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    const server = servers[index];
    return {
      name: server.name,
      address: server.address,
      online: false,
      players: 0,
      maxPlayers: null,
    };
  });

  return json({
    playerTracker: {
      totalOnline: serverList.reduce((sum, server) => sum + server.players, 0),
      servers: serverList,
      updatedAt: now,
    },
    updatedAt: new Date(now).toISOString(),
  }, {
    headers: {
      "Cache-Control": "public, max-age=30",
    },
  });
}

async function handleContact(request, env) {
  if (!env.DISCORD_WEBHOOK) {
    console.error("contact unavailable: missing DISCORD_WEBHOOK secret");
    return new Response("contact form is not configured right now. email me directly at me@jos.gg.", {
      status: 503,
    });
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

  let discordRes;
  try {
    discordRes = await fetch(env.DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("discord webhook request failed", error);
    return new Response("message delivery failed. email me directly at me@jos.gg.", {
      status: 502,
    });
  }

  if (!discordRes.ok) {
    const discordError = await discordRes.text();
    console.error("discord webhook rejected request", discordRes.status, discordError);
    return new Response("message delivery failed. email me directly at me@jos.gg.", {
      status: 502,
    });
  }

  return new Response("ok", { status: 200 });
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function fetchServerStatus(server) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(`https://api.mcstatus.io/v2/status/java/${server.address}`, {
      signal: controller.signal,
      headers: {
        "User-Agent": "jos.gg player tracker",
      },
    });

    if (!response.ok) {
      throw new Error(`mcstatus rejected ${server.address}: ${response.status}`);
    }

    const data = await response.json();

    return {
      name: server.name,
      address: server.address,
      online: Boolean(data.online),
      players: Number(data.players?.online ?? 0),
      maxPlayers: Number.isFinite(data.players?.max) ? data.players.max : null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      ...(init.headers ?? {}),
    },
  });
}
