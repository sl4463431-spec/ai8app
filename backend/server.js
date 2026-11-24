const express = require('express');
const cors = require('cors');
const { CROPS, ANIMALS } = require('./data.js');
const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_API_KEY;

// مكتبة المحاصيل والمواشي - ترد بسرعة من غير نت
function findInLibrary(msg) {
  for (let c of CROPS) {
    if (msg.includes(c.name)) {
      return `🌾 **${c.name}**\n\n**تتزرع امتى؟** ${c.زراعة}\n**تقعد قد ايه؟** ${c.مدة}\n**الفدان ينتج كام؟** ${c.انتاج}\n**الري:** ${c.ري}\n**الأرض المناسبة:** ${c.ارض}\n**أمراضها:** ${c.امراض}\n\n**نصيحة لزيادة الإنتاج:** اهتم بالري في مواعيده والسماد النيتروجيني في أول 40 يوم، هتزود إنتاجك 20%.`;
    }
  }
  for (let a of ANIMALS) {
    if (msg.includes(a.name)) {
      return `🐄 **${a.name}**\n\n**بياكل ايه؟** ${a.اكل}\n**بينتج قد ايه؟** ${a.انتاج}\n**التطعيم:** ${a.تطعيم}\n**أمراضه:** ${a.امراض}\n\n**نصيحة:** النظافة والعلف النضيف هما اللي بيزودوا اللبن واللحم.`;
    }
  }
  return null;
}

app.get('/', (req, res) => res.send('AI8 - الغيط شغال 🌾'));

app.get('/crops', (req, res) => res.json(CROPS));
app.get('/animals', (req, res) => res.json(ANIMALS));

app.post('/chat', async (req, res) => {
  try {
    const msg = req.body.message || '';
    // 1 - جرب المكتبة الأول
    const libAnswer = findInLibrary(msg);
    if (libAnswer) return res.json({ reply: libAnswer });

    // 2 - لو مش في المكتبة، اسأل جوجل Gemini عن أي حاجة في الدنيا
    if (!GEMINI_KEY) return res.json({ reply: 'المفتاح مش محطوط، حط GEMINI_API_KEY في Render' });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `انت رفيق الفلاح المصري، الغيط. رد بالعامية المصرية البسيطة، مختصر وواضح، واشرح أي سؤال: زراعة، محاصيل، أمراض نبات، مواشي، طقس، أسعار، أو أي حاجة في الدنيا. السؤال: ${msg}` }] }]
      })
    });
    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'مش فاهم، وضحلي أكتر يا فلاح';
    res.json({ reply });
  } catch (e) {
    res.json({ reply: 'في مشكلة في النت، جرب تاني' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('شغال على ' + PORT));
