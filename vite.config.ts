import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

function transferApiPlugin(): Plugin {
  return {
    name: 'transfer-api-plugin',
    configureServer(server) {
      // User persistence API endpoints (shared across iPhone, PC, and all sessions)
      server.middlewares.use('/api/users', async (req, res) => {
        const usersFilePath = path.resolve(process.cwd(), 'data', 'users.json');
        
        const readUsersFromFile = () => {
          try {
            if (fs.existsSync(usersFilePath)) {
              const content = fs.readFileSync(usersFilePath, 'utf-8');
              return JSON.parse(content || '[]');
            }
          } catch (e) {
            console.error('Error reading users file:', e);
          }
          return [];
        };

        const writeUsersToFile = (users: any[]) => {
          try {
            const dir = path.dirname(usersFilePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
          } catch (e) {
            console.error('Error writing users file:', e);
          }
        };

        const beneficiariesFilePath = path.resolve(process.cwd(), 'data', 'beneficiaries.json');

        const readBeneficiariesFromFile = () => {
          try {
            if (fs.existsSync(beneficiariesFilePath)) {
              const content = fs.readFileSync(beneficiariesFilePath, 'utf-8');
              return JSON.parse(content || '[]');
            }
          } catch (e) {
            console.error('Error reading beneficiaries file:', e);
          }
          return [];
        };

        const writeBeneficiariesToFile = (items: any[]) => {
          try {
            const dir = path.dirname(beneficiariesFilePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(beneficiariesFilePath, JSON.stringify(items, null, 2), 'utf-8');
          } catch (e) {
            console.error('Error writing beneficiaries file:', e);
          }
        };

        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'GET') {
          const users = readUsersFromFile();
          res.statusCode = 200;
          res.end(JSON.stringify(users));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const users = readUsersFromFile();
              const existingIndex = users.findIndex((u: any) => u.id === data.id || (data.email && u.email === data.email));
              if (existingIndex !== -1) {
                users[existingIndex] = { ...users[existingIndex], ...data };
              } else {
                users.unshift(data);
              }
              writeUsersToFile(users);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, user: data, users }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (req.method === 'PUT') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              if (Array.isArray(data.users)) {
                const currentUsers = readUsersFromFile();
                // Merge carefully: never wipe existing users if incoming list is smaller or default
                const userMap = new Map<string, any>();
                currentUsers.forEach((u: any) => userMap.set(u.id, u));
                data.users.forEach((u: any) => {
                  userMap.set(u.id, { ...userMap.get(u.id), ...u });
                });
                const merged = Array.from(userMap.values());
                writeUsersToFile(merged);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, users: merged }));
                return;
              }
              if (data.id) {
                const users = readUsersFromFile();
                const idx = users.findIndex((u: any) => u.id === data.id);
                if (idx !== -1) {
                  users[idx] = { ...users[idx], ...data };
                  writeUsersToFile(users);
                }
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, user: users[idx] }));
                return;
              }
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid payload' }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (req.method === 'DELETE') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              if (data.id) {
                let users = readUsersFromFile();
                users = users.filter((u: any) => u.id !== data.id);
                writeUsersToFile(users);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, users }));
                return;
              }
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing id' }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });

      // Beneficiaries persistence endpoint
      server.middlewares.use('/api/beneficiaries', async (req, res) => {
        const beneficiariesFilePath = path.resolve(process.cwd(), 'data', 'beneficiaries.json');
        const readBeneficiariesFromFile = () => {
          try {
            if (fs.existsSync(beneficiariesFilePath)) {
              const content = fs.readFileSync(beneficiariesFilePath, 'utf-8');
              return JSON.parse(content || '[]');
            }
          } catch (e) {
            console.error('Error reading beneficiaries file:', e);
          }
          return [];
        };

        const writeBeneficiariesToFile = (items: any[]) => {
          try {
            const dir = path.dirname(beneficiariesFilePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(beneficiariesFilePath, JSON.stringify(items, null, 2), 'utf-8');
          } catch (e) {
            console.error('Error writing beneficiaries file:', e);
          }
        };

        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'GET') {
          const list = readBeneficiariesFromFile();
          res.statusCode = 200;
          res.end(JSON.stringify(list));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const item = JSON.parse(body || '{}');
              const list = readBeneficiariesFromFile();
              const existingIdx = list.findIndex((b: any) => b.id === item.id || b.account === item.account);
              if (existingIdx !== -1) {
                list[existingIdx] = { ...list[existingIdx], ...item };
              } else {
                list.unshift(item);
              }
              writeBeneficiariesToFile(list);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, item, beneficiaries: list }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (req.method === 'DELETE') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { id } = JSON.parse(body || '{}');
              let list = readBeneficiariesFromFile();
              list = list.filter((b: any) => b.id !== id);
              writeBeneficiariesToFile(list);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, beneficiaries: list }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });

      // Transfers persistence endpoint (syncs real transfers between all accounts in this environment)
      server.middlewares.use('/api/transfers', async (req, res) => {
        const transfersFilePath = path.resolve(process.cwd(), 'data', 'transfers.json');
        const readTransfersFromFile = () => {
          try {
            if (fs.existsSync(transfersFilePath)) {
              const content = fs.readFileSync(transfersFilePath, 'utf-8');
              return JSON.parse(content || '[]');
            }
          } catch (e) {
            console.error('Error reading transfers file:', e);
          }
          return [];
        };

        const writeTransfersToFile = (items: any[]) => {
          try {
            const dir = path.dirname(transfersFilePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(transfersFilePath, JSON.stringify(items, null, 2), 'utf-8');
          } catch (e) {
            console.error('Error writing transfers file:', e);
          }
        };

        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'GET') {
          const list = readTransfersFromFile();
          res.statusCode = 200;
          res.end(JSON.stringify(list));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const item = JSON.parse(body || '{}');
              const list = readTransfersFromFile();
              const existingIdx = list.findIndex((t: any) => t.id === item.id);
              if (existingIdx !== -1) {
                list[existingIdx] = { ...list[existingIdx], ...item };
              } else {
                list.unshift(item);
              }
              writeTransfersToFile(list);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, item, transfers: list }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (req.method === 'PUT') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              if (Array.isArray(data.transfers)) {
                const current = readTransfersFromFile();
                const map = new Map<string, any>();
                current.forEach((t: any) => map.set(t.id, t));
                data.transfers.forEach((t: any) => map.set(t.id, { ...map.get(t.id), ...t }));
                const merged = Array.from(map.values());
                writeTransfersToFile(merged);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, transfers: merged }));
                return;
              }
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid payload' }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });

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

