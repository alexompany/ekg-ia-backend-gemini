const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3000;

app.post('/completions', async (req, res) => {
  const { image_base64 } = req.body;

  if (!image_base64) {
    return res.status(400).json({ error: 'Falta imagen en base64' });
  }

  const payload = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: image_base64,
            }
          },
          {
            text: "Actúa como cardiólogo experto. Evalúa el EKG mostrado en esta imagen según guías internacionales actualizadas. Proporciona el diagnóstico en máximo 2 líneas, breve y claro. No repitas el prompt."
          }
        ]
      }
    ]
  };

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.candidates[0].content.parts[0].text;
    res.json({ content });

  } catch (error) {
    console.error('Error consultando Gemini:', error.response?.data || error.message);
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      res.status(500).json({ error: 'Error desconocido en servidor Gemini' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Gemini activo en puerto ${PORT}`);
});
