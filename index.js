import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3000;

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;

app.post('/ekg', async (req, res) => {
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
            text: `Actúa como cardiólogo experto en interpretación de EKG. Evalúa la imagen proporcionada y responde con:

- Frecuencia cardíaca (lpm)
- Ritmo cardíaco (sinusal, fibrilación, flutter)
- Intervalo PR (normal, corto o prolongado)
- Duración del QRS (normal o ancho)
- QTc corregido (normal o prolongado)
- Eje eléctrico
- Anomalías en ST y T
- Diagnóstico principal
- Comentario breve (máximo 2 líneas)

No expliques términos. No te identifiques como IA. Solo responde clínicamente.`
          }
        ]
      }
    ]
  };

  try {
    const response = await axios.post(GEMINI_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Respuesta vacía de Gemini';
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

app.post('/echo', async (req, res) => {
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
            text: `Actúa como cardiólogo experto en ecocardiografía. Evalúa la imagen proporcionada y responde con:

- Fracción de eyección del ventrículo izquierdo (FEVI)
- Función sistólica y diastólica del VI
- Dimensiones y función del ventrículo derecho (TAPSE, FAC)
- Presión sistólica estimada de la arteria pulmonar (PSAP)
- Evaluación de las válvulas cardíacas: presencia de estenosis o insuficiencia (aórtica, mitral, tricuspídea, pulmonar)
- Tamaño de la aurícula izquierda y vena cava inferior
- Presencia de derrame pericárdico, masas intracardíacas o vegetaciones
- Diagnóstico principal
- Comentario breve (máximo 2 líneas)

No expliques términos. No te identifiques como IA. Solo responde clínicamente.`
          }
        ]
      }
    ]
  };

  try {
    const response = await axios.post(GEMINI_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Respuesta vacía de Gemini';
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
