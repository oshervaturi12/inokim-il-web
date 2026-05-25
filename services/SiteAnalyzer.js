// const { generateInsight } = require('./openAIService');
// const AIInsight = require('../models/AIInsight');

// class SiteAnalyzer {
//   constructor(baseUrl) {
//     this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
//   }

//   async analyzeHTML(html, url = '', key = '') {
//     const prompt = `
// נתח את קוד ה-HTML של הדף הבא (${url}) והחזר מבנה JSON עם שני שדות:

// {
//   "problems": [
//     { "type": "UX", "description": "הכפתור אינו בולט מספיק" },
//     { "type": "SEO", "description": "אין כותרת H1 בדף" }
//   ],
//   "abTestIdeas": [
//     {
//       "name": "CTA Button Color Test",
//       "description": "בדיקת לחצן רכישה בצבעים שונים",
//       "variants": ["כחול כהה", "ירוק בולט"],
//       "goal": "שיעור ההקלקות על הכפתור"
//     }
//   ]
// }

// קוד ה-HTML לבדיקה:

// ${html}
//     `.trim();

//     const rawTextResponse = await generateInsight(prompt, {
//       model: 'gpt-4o',
//       maxTokens: 1500,
//       system: 'אתה מומחה לאופטימיזציה של אתרים עם ניסיון בשיווק דיגיטלי וחוויית משתמש.'
//     });

//     let parsed = {};
//     try {
//       parsed = JSON.parse(rawTextResponse);
//     } catch (err) {
//       console.warn('⚠️ Failed to parse AI response as JSON:', err.message);
//     }

//     await this.saveInsight({
//       source: 'page_analysis',
//       type: 'html_analysis',
//       key,
//       title: `HTML Analysis for ${url}`,
//       url,
//       prompt,
//       response: rawTextResponse,
//       model: 'gpt-4o',
//       metadata: {
//         analyzedAt: new Date().toISOString(),
//         ...parsed
//       }
//     });

//     return parsed;
//   }

//   async analyzeTextContent(text, title = '', key = '', url = '') {
//     const prompt = `
// בצע ניתוח תוכן שיווקי למקטע "${title}".
// זהה את הכוונה, את הקריאה לפעולה, ובדוק האם הניסוח מושך וברור.
// הצע ניסוחים טובים יותר במידת הצורך:

// ${text}
//     `.trim();

//     const response = await generateInsight(prompt, {
//       model: 'gpt-3.5-turbo',
//       temperature: 0.6,
//       system: 'אתה קופירייטר מומחה עם התמחות ב-UX ו-SEO'
//     });

//     await this.saveInsight({
//       source: 'page_analysis',
//       type: 'text_section',
//       key,
//       title: `Text Analysis: ${title}`,
//       url,
//       prompt,
//       response,
//       model: 'gpt-3.5-turbo'
//     });

//     return response;
//   }

//   async analyzePerformanceHints(reportText, url = '', key = '') {
//     const prompt = `
// בהתבסס על הדוח הבא, תן תובנות לשיפור ביצועי האתר (LCP, CLS, וכו').
// השתמש בשפה ברורה והצע פתרונות קונקרטיים:

// ${reportText}
//     `.trim();

//     const response = await generateInsight(prompt, {
//       model: 'gpt-3.5-turbo',
//       maxTokens: 500,
//       system: 'אתה יועץ ביצועים המתמחה בשיפור מהירות אתרים.'
//     });

//     await this.saveInsight({
//       source: 'page_analysis',
//       type: 'performance',
//       key,
//       title: `Performance Audit for ${url}`,
//       url,
//       prompt,
//       response,
//       model: 'gpt-3.5-turbo'
//     });

//     return response;
//   }

//   async saveInsight({ source, type, key, title, url, prompt, response, model = 'gpt-4', metadata = {} }) {
//     return await AIInsight.findOneAndUpdate(
//       { source, key, url, type },
//       {
//         source,
//         type,
//         key,
//         title,
//         prompt,
//         response,
//         model,
//         url,
//         metadata: {
//           analyzedAt: new Date().toISOString(),
//           ...metadata
//         }
//       },
//       { upsert: true, new: true }
//     );
//   }
// }

// module.exports = SiteAnalyzer;


const { generateInsight } = require('./openAIService');
const AIInsight = require('../models/AIInsight');

class SiteAnalyzer {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  async analyzeHTML(html, url = '', key = '') {
    const prompt = `
    סרוק את קוד ה-HTML של הדף הבא (${url}) ונתח את המבנה, התוכן, הקריאות לפעולה והטעינה.
    
    החזר תובנות ממוקדות בשני חלקים:
    
    1. בעיות UX, CRO, SEO שזיהית (תן תיאור קצר לכל בעיה).
    2. רעיונות לניסויי A/B שיכולים לבדוק פתרונות לבעיות שזיהית (תן שם, תיאור קצר, מה משתנה בכל גרסה ומה למדוד).
    
    ${html}
    `.trim();
    

    const { raw, json } = await generateInsight(prompt, {
      model: 'gpt-4o',
      maxTokens: 1500,
      returnJson: true,
      system: 'אתה מומחה לאופטימיזציה של אתרים עם ניסיון בשיווק דיגיטלי וחוויית משתמש.'
    });

    await this.saveInsight({
      source: 'page_analysis',
      type: 'html_analysis',
      key,
      title: `HTML Analysis for ${url}`,
      url,
      prompt,
      response: raw,
      model: 'gpt-4o',
      metadata: {
        analyzedAt: new Date().toISOString(),
        ...json // יכול להיות null - זה בסדר
      }
    });

    return json || {};
  }

  async analyzeTextContent(text, title = '', key = '', url = '') {
    const prompt = `
בצע ניתוח תוכן שיווקי למקטע "${title}".
זהה את הכוונה, את הקריאה לפעולה, ובדוק האם הניסוח מושך וברור.
הצע ניסוחים טובים יותר במידת הצורך:

${text}
    `.trim();

    const raw = await generateInsight(prompt, {
      model: 'gpt-3.5-turbo',
      temperature: 0.6,
      system: 'אתה קופירייטר מומחה עם התמחות ב-UX ו-SEO'
    });

    await this.saveInsight({
      source: 'page_analysis',
      type: 'text_section',
      key,
      title: `Text Analysis: ${title}`,
      url,
      prompt,
      response: raw,
      model: 'gpt-3.5-turbo'
    });

    return raw;
  }

  async analyzePerformanceHints(reportText, url = '', key = '') {
    const prompt = `
בהתבסס על הדוח הבא, תן תובנות לשיפור ביצועי האתר (LCP, CLS, וכו').
השתמש בשפה ברורה והצע פתרונות קונקרטיים:

${reportText}
    `.trim();

    const raw = await generateInsight(prompt, {
      model: 'gpt-3.5-turbo',
      maxTokens: 500,
      system: 'אתה יועץ ביצועים המתמחה בשיפור מהירות אתרים.'
    });

    await this.saveInsight({
      source: 'page_analysis',
      type: 'performance',
      key,
      title: `Performance Audit for ${url}`,
      url,
      prompt,
      response: raw,
      model: 'gpt-3.5-turbo'
    });

    return raw;
  }

  async saveInsight({ source, type, key, title, url, prompt, response, model = 'gpt-4', metadata = {} }) {
    return await AIInsight.findOneAndUpdate(
      { source, key, url, type },
      {
        source,
        type,
        key,
        title,
        prompt,
        response,
        model,
        url,
        metadata: {
          analyzedAt: new Date().toISOString(),
          ...metadata
        }
      },
      { upsert: true, new: true }
    );
  }
}

module.exports = SiteAnalyzer;

