export async function onRequest({ request }) {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "https://rfp-bot.pages.dev",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }

  try {
    // Parse the request body
    const reqBody = await request.json();

    if (!reqBody.n8nUrl) {
      return new Response(JSON.stringify({ error: "Missing n8nUrl in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { n8nUrl, ...payload } = reqBody;

    // Forward request to the dynamic n8n URL
    const resp = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const contentType = resp.headers.get("content-type") || "";
    const bodyText = await resp.text();

    // Forward the response back to the browser
    return new Response(bodyText, {
      status: resp.status,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "https://rfp-bot.pages.dev",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
