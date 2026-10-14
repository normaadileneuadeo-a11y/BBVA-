import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

function transferApiPlugin(): Plugin {
  return {
    name: 'transfer-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/analyze-receipt', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const { imageBase64, mimeType, fileName, textSample } = data;

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                isAi: false,
                message: 'No GEMINI_API_KEY, using local parser',
              }));
              return;
            }

            const ai = new GoogleGenAI({
              apiKey: apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            const prompt = `Analiza este comprobante de transferencia bancaria mexicana/latinoamericana (SPEI, CEP Banxico, BBVA, Citibanamex, Banorte, Santander, Nu, Mercado Pago, STP, Banco Azteca, HSBC, Scotiabank, etc.).
Archivo: "${fileName || 'comprobante'}".
Texto detectado si existe: "${textSample || ''}".
Extrae los siguientes datos con máxima precisión y responde ÚNICAMENTE en JSON con este esquema:
{
  "emisor": "Nombre completo de la persona o empresa ordenante / emisor",
  "receptor": "Nombre completo de la persona o empresa beneficiario / receptor",
  "bancoEmisor": "Banco de origen (ej: BBVA, Santander, Banamex, Banorte, Nu, STP, etc.)",
  "bancoReceptor": "Banco destino",
  "cuentaOrigen": "Últimos dígitos o cuenta/CLABE origen si aparece",
  "cuentaDestino": "Cuenta, CLABE o tarjeta beneficiario",
  "monto": 0.00,
  "moneda": "MXN",
  "fecha": "YYYY-MM-DD",
  "hora": "HH:MM",
  "concepto": "Concepto o motivo de pago",
  "claveRastreo": "Clave de rastreo alfanumérica SPEI / folio Banxico",
  "folio": "Folio interno o de operación",
  "referencia": "Referencia numérica",
  "tipo": "Egreso" o "Ingreso",
  "estado": "Exitoso" o "Liquidado" o "Pendiente",
  "resumen": "Resumen conciso del movimiento"
}
IMPORTANTE: "monto" debe ser estrictamente un número sin signos de pesos ni comas.`;

            const parts: any[] = [];
            if (imageBase64) {
              const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
              parts.push({
                inlineData: {
                  data: cleanBase64,
                  mimeType: mimeType || 'image/jpeg',
                },
              });
            }
            parts.push({ text: prompt });

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: { parts },
              config: {
                responseMimeType: 'application/json',
              },
            });

            const rawText = response.text || '{}';
            let parsed = {};
            try {
              parsed = JSON.parse(rawText);
            } catch {
              parsed = { error: 'Parse failed', raw: rawText };
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ isAi: true, data: parsed }));
          } catch (err: any) {
            console.error('API analyze receipt error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Error processing' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), transferApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

