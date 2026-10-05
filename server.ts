import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();

  // Parse port from command line argument (--port <PORT>) or environment variable
  let portArg = 3000;
  const portArgIndex = process.argv.indexOf("--port");
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(parsed)) portArg = parsed;
  }
  const PORT = Number(process.env.PORT) || portArg || 3000;

  app.use(express.json());

  // Global cached exchange rates
  let cachedRates = {
    USD: 385.0,
    CUP: 385.0,
    cupPerUsd: 385.0,
    MLC: 280.0,
    mlcPerUsd: 1.38,
    EUR: 400.0,
    timestamp: Date.now() - (2 * 60 * 60 * 1000), // Default initialized as 2 hours ago
    source: "El Toque"
  };

  const updateExchangeRates = async () => {
    try {
      // 1. If an official El Toque API token is configured via environment variable
      if (process.env.EL_TOQUE_TOKEN) {
        try {
          const response = await fetch("https://api.eltoque.com/v1/trmi", {
            headers: {
              "Authorization": `Bearer ${process.env.EL_TOQUE_TOKEN}`,
              "User-Agent": "DCubanBeats/1.0"
            },
            signal: AbortSignal.timeout(4000)
          });
          if (response.ok) {
            const data = await response.json();
            if (data && data.rates) {
              const usdVal = parseFloat(data.rates.USD) || cachedRates.USD;
              const mlcVal = parseFloat(data.rates.MLC) || cachedRates.MLC;
              const eurVal = parseFloat(data.rates.EUR) || cachedRates.EUR;
              cachedRates.USD = usdVal;
              cachedRates.CUP = usdVal;
              cachedRates.cupPerUsd = usdVal;
              cachedRates.MLC = mlcVal;
              cachedRates.mlcPerUsd = Number((usdVal / mlcVal).toFixed(4));
              cachedRates.EUR = eurVal;
              cachedRates.source = "El Toque (API Oficial)";
              cachedRates.timestamp = Date.now();
              console.log(`[ExchangeRates Job] Updated from El Toque API at ${new Date().toISOString()}`);
              return;
            }
          }
        } catch (tokenErr) {
          console.warn("[ExchangeRates Job] El Toque token request error:", tokenErr);
        }
      }

      // 2. Try informal rates endpoint
      try {
        const response = await fetch("https://api.toque.io/v1/rates?g=informal", {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          },
          signal: AbortSignal.timeout(4000)
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.rates) {
            const usdVal = parseFloat(data.rates.USD) || cachedRates.USD;
            const mlcVal = parseFloat(data.rates.MLC) || cachedRates.MLC;
            const eurVal = parseFloat(data.rates.EUR) || cachedRates.EUR;
            cachedRates.USD = usdVal;
            cachedRates.CUP = usdVal;
            cachedRates.cupPerUsd = usdVal;
            cachedRates.MLC = mlcVal;
            cachedRates.mlcPerUsd = Number((usdVal / mlcVal).toFixed(4));
            cachedRates.EUR = eurVal;
            cachedRates.source = "El Toque (API Informal)";
            cachedRates.timestamp = Date.now();
            console.log(`[ExchangeRates Job] Updated rates via Toque.io at ${new Date().toISOString()}`);
            return;
          }
        }
      } catch (e) {
        // Fallthrough to scraper or reference
      }

      // 3. Try fallback scraper
      const htmlRes = await fetch("https://eltoque.com/", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        signal: AbortSignal.timeout(4000)
      });
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        const usdMatch = html.match(/"USD"\s*:\s*(\d+(\.\d+)?)/) || html.match(/USD.*?(\d{3})/);
        const mlcMatch = html.match(/"MLC"\s*:\s*(\d+(\.\d+)?)/) || html.match(/MLC.*?(\d{3})/);
        const eurMatch = html.match(/"EUR"\s*:\s*(\d+(\.\d+)?)/) || html.match(/EUR.*?(\d{3})/);

        if (usdMatch) {
          const parsedUSD = parseFloat(usdMatch[1]);
          cachedRates.USD = parsedUSD;
          cachedRates.CUP = parsedUSD;
          cachedRates.cupPerUsd = parsedUSD;
        }
        if (mlcMatch) {
          const parsedMLC = parseFloat(mlcMatch[1]);
          cachedRates.MLC = parsedMLC;
          cachedRates.mlcPerUsd = Number((cachedRates.USD / parsedMLC).toFixed(4));
        }
        if (eurMatch) cachedRates.EUR = parseFloat(eurMatch[1]);
        cachedRates.source = "El Toque (Scraper Web)";
        cachedRates.timestamp = Date.now();
        console.log(`[ExchangeRates Job] Updated rates via Scraper at ${new Date().toISOString()}`);
      }
    } catch (e) {
      // Keep resilient market rates
      cachedRates.source = "El Toque";
    }
  };

  // Initial fetch on server start (non-blocking)
  updateExchangeRates().catch(() => {});

  // Scheduled task: Update rates every 12 hours (12 * 60 * 60 * 1000 ms)
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
  setInterval(updateExchangeRates, TWELVE_HOURS_MS);

  // API Route to fetch real-time exchange rates from El Toque
  app.get("/api/exchange-rates", async (req, res) => {
    // If cache is older than 12 hours, trigger an async refresh
    if (Date.now() - cachedRates.timestamp > TWELVE_HOURS_MS) {
      updateExchangeRates().catch(() => {});
    }
    res.json(cachedRates);
  });

  // Vite middleware setup for development, static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Fallback for HTML routing in development
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(process.cwd(), "index.html");
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, "utf-8");
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        } else {
          next();
        }
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
  });

  server.on("error", (err: any) => {
    console.error("Server error:", err);
  });

  const handleShutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", handleShutdown);
  process.on("SIGINT", handleShutdown);
}

startServer();
