import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Global cached exchange rates
  let cachedRates = {
    USD: 360.0,
    MLC: 280.0,
    EUR: 370.0,
    CLASICA: 310.0,
    timestamp: Date.now(),
    source: "El Toque (Fallback)"
  };

  const updateExchangeRates = async () => {
    try {
      // Try to fetch from El Toque / Toque.io informal rates endpoint
      const response = await fetch("https://api.toque.io/v1/rates?g=informal", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.rates) {
          cachedRates.USD = data.rates.USD || cachedRates.USD;
          cachedRates.MLC = data.rates.MLC || cachedRates.MLC;
          cachedRates.EUR = data.rates.EUR || cachedRates.EUR;
          cachedRates.CLASICA = data.rates.VAL_CLASICA || data.rates.CLASICA || cachedRates.CLASICA;
          cachedRates.source = "El Toque (API 12h Cron)";
          cachedRates.timestamp = Date.now();
          console.log(`[ExchangeRates Job] Updated rates successfully at ${new Date().toISOString()}`);
          return;
        }
      }

      // Try scraping from the eltoque home page if the API fails
      const htmlRes = await fetch("https://eltoque.com/", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        const usdMatch = html.match(/"USD"\s*:\s*(\d+(\.\d+)?)/) || html.match(/USD.*?(\d{3})/);
        const mlcMatch = html.match(/"MLC"\s*:\s*(\d+(\.\d+)?)/) || html.match(/MLC.*?(\d{3})/);
        const eurMatch = html.match(/"EUR"\s*:\s*(\d+(\.\d+)?)/) || html.match(/EUR.*?(\d{3})/);
        const clasicaMatch = html.match(/"(CLASICA|VAL_CLASICA)"\s*:\s*(\d+(\.\d+)?)/) || html.match(/CLASICA.*?(\d{3})/);

        if (usdMatch) cachedRates.USD = parseFloat(usdMatch[1]);
        if (mlcMatch) cachedRates.MLC = parseFloat(mlcMatch[1]);
        if (eurMatch) cachedRates.EUR = parseFloat(eurMatch[1]);
        if (clasicaMatch) cachedRates.CLASICA = parseFloat(clasicaMatch[1]);
        cachedRates.source = "El Toque (Scraper 12h Cron)";
        cachedRates.timestamp = Date.now();
        console.log(`[ExchangeRates Job] Updated rates via Scraper at ${new Date().toISOString()}`);
      }
    } catch (e) {
      cachedRates.source = "Local Database (Fallback)";
      cachedRates.timestamp = Date.now();
    }
  };

  // Initial fetch on server start
  updateExchangeRates();

  // Scheduled task: Update rates every 12 hours (12 * 60 * 60 * 1000 ms)
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
  setInterval(updateExchangeRates, TWELVE_HOURS_MS);

  // API Route to fetch real-time exchange rates from El Toque
  app.get("/api/exchange-rates", async (req, res) => {
    // If cache is older than 12 hours, trigger an async refresh
    if (Date.now() - cachedRates.timestamp > TWELVE_HOURS_MS) {
      updateExchangeRates();
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
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
