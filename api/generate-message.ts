import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { country, weather } = req.body;

  if (!country) {
    return res.status(400).json({ error: 'Missing country data' });
  }

  const weatherDesc = weather?.weathercode !== -1 && weather?.description
    ? `${weather.description} (${weather.temperature}°C, vent ${weather.windspeed} km/h)`
    : 'les éléments sont imprévisibles';

  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Tu es un héraut médiéval grandiloquent. Rédige un message Slack pour demander des congés à son manager afin de partir en ${country.name} (capitale : ${country.capital} ${country.flag}).

Contexte du voyage :
- Fun fact dramatique : ${country.funFact}
- Météo sur place : ${weatherDesc}

Règles absolues :
- ÉCRIS EN VIEUX FRANÇOIS du XIVe siècle : "je" → "je" ou "jou", "vous" → "vos", "est" → "est" ou "estre", "très" → "moult", "pour" → "por" ou "pour", "mais" → "mes", "notre" → "nostre", "votre" → "vostre", "peut" → "puet", "faire" → "faire" ou "fere", utilise "icelui", "ledit", "par deçà", "advenu", "oultre", "oncques", "pléust", "quérir", etc.
- Mélange vieux françois authentique et références Slack modernes (mentions @manager, emojis)
- Utilise des emojis médiévaux : ⚔️ 🏰 👑 🗡️ 🛡️ 🐉 🧙 🪄 📯 ⚜️
- Adresse-toi à "Moult Hault Sire @manager"
- Invoque le fun fact comme raison impérieuse du voyage
- Mentionne la météo de façon dramatique
- 4 à 6 lignes maximum
- Termine par une formule de dévotion servile en vieux françois

Génère UNIQUEMENT le message Slack, sans intro ni explication.`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  const text = textBlock && textBlock.type === 'text' ? textBlock.text : '';
  res.status(200).json({ message: text });
}
