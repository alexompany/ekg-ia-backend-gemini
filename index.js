const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// API Key directa (reemplaza .env)
const genAI = new GoogleGenerativeAI("AIzaSyAtUhl62pNjZRFsL9OTIhZFuCp57RhyHqo");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '15mb' }));

app.post('/completions', async (req, res) => {
  try {
    const { image_base64 } = req.body;

    if (!image_base64) {
      return res.status(400).json({ error: 'Falta imagen en base64' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: image_base64,
        },
      },
      {
        text: `Actúa como cardiólogo experto. Evalúa este EKG según guías clínicas internacionales. Devuélveme:

- Frecuencia cardíaca (lpm)
- Ritmo cardíaco (sinusal, fibrilación, etc.)
- Intervalo PR (normal, corto o prolongado)
- QRS (normal o ancho)
- QTc (normal o prolongado)
- Eje eléctrico
- Anomalías en ST/T
- Diagnóstico principal
- Comentario médico (máximo 2 líneas)

No expliques términos. No digas que eres una IA. Solo responde clínicamente.`,
      },
    ]);

    const text = result.response.text();
    res.json({ content: text });

  } catch (error) {
    console.error("❌ Error Gemini:", error.message || error);
    res.status(500).json({ error: 'Error al procesar imagen con Gemini.' });
  }
});

app.get('/', (req, res) => {
  res.send('Servidor Gemini activo y escuchando.');
});

app.listen(port, () => {
  console.log(`🚀 Servidor Gemini escuchando en http://localhost:${port}`);
});


