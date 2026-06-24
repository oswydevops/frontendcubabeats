import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to fetch real-time exchange rates from El Toque
  app.get("/api/exchange-rates", async (req, res) => {
    // Realistic default informal market rates in Cuba (fallback)
    // 1 USD cash = ~360 CUP
    // 1 MLC card = ~280 CUP
    // 1 EUR cash = ~370 CUP
    // 1 Clásica card = ~310 CUP
    const rates = {
      USD: 360.0,
      MLC: 280.0,
      EUR: 370.0,
      CLASICA: 310.0,
      timestamp: Date.now(),
      source: "El Toque (Fallback)"
    };

    try {
      // 1. Try to fetch from El Toque / Toque.io informal rates endpoint
      const response = await fetch("https://api.toque.io/v1/rates?g=informal", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.rates) {
          rates.USD = data.rates.USD || rates.USD;
          rates.MLC = data.rates.MLC || rates.MLC;
          rates.EUR = data.rates.EUR || rates.EUR;
          rates.CLASICA = data.rates.VAL_CLASICA || data.rates.CLASICA || rates.CLASICA;
          rates.source = "El Toque (API)";
        }
      } else {
        // 2. Try scraping from the eltoque home page if the API fails
        const htmlRes = await fetch("https://eltoque.com/", {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          }
        });
        if (htmlRes.ok) {
          const html = await htmlRes.text();
          
          // Look for direct key value rates in HTML
          const usdMatch = html.match(/"USD"\s*:\s*(\d+(\.\d+)?)/) || html.match(/USD.*?(\d{3})/);
          const mlcMatch = html.match(/"MLC"\s*:\s*(\d+(\.\d+)?)/) || html.match(/MLC.*?(\d{3})/);
          const eurMatch = html.match(/"EUR"\s*:\s*(\d+(\.\d+)?)/) || html.match(/EUR.*?(\d{3})/);
          const clasicaMatch = html.match(/"(CLASICA|VAL_CLASICA)"\s*:\s*(\d+(\.\d+)?)/) || html.match(/CLASICA.*?(\d{3})/);

          if (usdMatch) rates.USD = parseFloat(usdMatch[1]);
          if (mlcMatch) rates.MLC = parseFloat(mlcMatch[1]);
          if (eurMatch) rates.EUR = parseFloat(eurMatch[1]);
          if (clasicaMatch) rates.CLASICA = parseFloat(clasicaMatch[1]);
          rates.source = "El Toque (Scraper)";
        }
      }
    } catch (e) {
      // Quietly fall back without logging the full exception stack to keep console clean of network/SSL warnings
      rates.source = "Local Database (Mock)";
    }

    res.json(rates);
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
