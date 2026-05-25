const { OpenAI } = require("openai");
const Product = require("../models/Products");
const Location = require("../models/Location");

class ChatService {
  constructor(io) {
    this.io = io;
    this.openai = new OpenAI({ apiKey: process.env.SECRET_KEY });

    this.initChat();
  }

  /**  Initialize WebSocket for Real-Time Chat */
  initChat() {
    this.io.on("connection", (socket) => {
      console.log(`🟢 User connected: ${socket.id}`);

      socket.on("chat message", async (msg) => {
        console.log(`💬 Received from ${socket.id}: ${msg}`);
        const aiReply = await this.processChatMessage(socket, msg);
        socket.emit("chat message", aiReply);
      });

      socket.on("disconnect", () => {
        console.log(`🔴 User disconnected: ${socket.id}`);
      });
    });
  }

  /** Process Chat Message */
  async processChatMessage(socket, message) {
    message = message.toLowerCase();

    if (message.includes("שעות פתיחה")) return await this.getWorkingHours();
    if (message.includes("קורקינט") || message.includes("איזה קורקינט מתאים לי")) {
      return this.startScooterRecommendation(socket);
    }

    // **No Fallback – Always Ask AI**
    return await this.getAIResponse(message);
  }

  /**  AI Always Responds Intelligently */
  async getAIResponse(message) {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: "system", content: "אתה סוכן מכירות חכם של אינוקים, חברה לקורקינטים חשמליים." },
          { role: "user", content: message }
        ],
        model: "gpt-4",
      });

      return completion.choices[0]?.message?.content || "🤖 אני כאן לעזור! איך אפשר לסייע?";
    } catch (error) {
      console.error("❌ AI Error:", error);
      return "מצטער, לא הצלחתי לעבד את הבקשה שלך כרגע. נסה שוב.";
    }
  }

  /**  Ask User Questions to Determine the Best Scooter */
  async startScooterRecommendation(socket) {
    socket.emit("chat message", "🤖 איזה מרחק אתה נוסע בדרך כלל ביום?");
    
    socket.once("chat message", async (distanceReply) => {
      socket.emit("chat message", "🤖 האם חשוב לך שהקורקינט יהיה קל ונוח לנשיאה?");
      
      socket.once("chat message", async (portabilityReply) => {
        socket.emit("chat message", "🤖 מה התקציב שלך?");
        
        socket.once("chat message", async (budgetReply) => {
          const recommendedScooter = await this.recommendScooter(distanceReply, portabilityReply, budgetReply);
          socket.emit("chat message", recommendedScooter);
        });
      });
    });

    return "🤖 אני אעזור לך לבחור את הקורקינט המתאים ביותר! תענה לי על כמה שאלות.";
  }

  /** ✅ Recommend a Scooter Based on User Answers */
  async recommendScooter(distance, portability, budget) {
    let query = { templateType: "scooter" };

    if (budget && !isNaN(parseInt(budget))) {
      query.price = { $lte: parseInt(budget) };
    }

    let scooters = await Product.find(query)
      .select("name price range battary slug variants")
      .lean();

    if (!scooters.length) return "🚲 לא נמצאו דגמים זמינים בתקציב שלך.";

    // Filter by range
    if (distance) {
      scooters = scooters.filter((scooter) => {
        const maxRange = Math.max(...scooter.variants.map((v) => parseInt(v.range) || 0));
        return maxRange >= parseInt(distance);
      });
    }

    // Sort by price, range, and portability
    scooters.sort((a, b) => a.price - b.price || parseInt(b.range) - parseInt(a.range));

    // Select best match
    const bestScooter = scooters[0];

    return `
    **🚀 ${bestScooter.name}**
    📏 טווח נסיעה: ${bestScooter.range} ק"מ
    🔋 סוג סוללה: ${bestScooter.battary || "לא ידוע"}
    💰 מחיר: ${bestScooter.price ? `${bestScooter.price} ₪` : "לא זמין"}
    🔗 לפרטים נוספים: [inokim.com/product/${bestScooter.slug}](https://il.inokim.com/product/${bestScooter.slug})
    `;
  }

  /** Fetch Working Hours for "חנות אינוקים" */
  async getWorkingHours() {
    const locations = await Location.find({ type: "חנות אינוקים" }).select("name workingHours");
    if (!locations.length) return "⏰ לא נמצאו שעות פתיחה.";

    return locations
      .map((loc) => `📍 ${loc.name} - ${loc.workingHours.sunday.open}-${loc.workingHours.sunday.close}`)
      .join("\n");
  }
}

module.exports = ChatService;
