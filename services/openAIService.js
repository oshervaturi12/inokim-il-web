// const OpenAI = require('openai');

// const openai = new OpenAI({ apiKey: process.env.SECRET_KEY });

// async function generateInsight(prompt, options = {}) {
//   try {
//     const response = await openai.chat.completions.create({
//       model: options.model || 'gpt-4',
//       temperature: options.temperature || 0.7,
//       max_tokens: options.maxTokens || 300,
//       messages: [
//         { role: 'system', content: options.system || 'You are a senior analytics expert.' },
//         { role: 'user', content: prompt }
//       ],
//     });

//     return response.choices[0].message.content;
//   } catch (err) {
//     console.error('❌ OpenAI Error:', err);
//     return null;
//   }
// }

// module.exports = {
//   generateInsight
// };


const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.SECRET_KEY });

async function generateInsight(prompt, options = {}) {
  try {
    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-4',
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 300,
      messages: [
        { role: 'system', content: options.system || 'You are a senior analytics expert.' },
        { role: 'user', content: prompt }
      ],
    });

    const content = response.choices[0].message.content;

    // ✅ Try to return parsed JSON if requested
    if (options.returnJson) {
      try {
        const match = content.match(/{[\s\S]*}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          return { raw: content, json: parsed };
        } else {
          console.warn('⚠️ No JSON block found in AI response.');
        }
      } catch (jsonErr) {
        console.warn('⚠️ Failed to parse AI response as JSON:', jsonErr.message);
      }
    }

    return options.returnJson ? { raw: content, json: null } : content;
  } catch (err) {
    console.error('❌ OpenAI Error:', err);
    return null;
  }
}

module.exports = {
  generateInsight
};
