// const retryWithBackoff = async (fn, maxRetries = 3) => {
//   for (let attempt = 0; attempt <= maxRetries; attempt++) {
//     try {
//       return await fn();
//     } catch (error) {
//       const isRateLimit =
//         error?.status === 429 ||
//         error?.message?.includes("429") ||
//         error?.message?.includes("quota") ||
//         error?.message?.includes("rate");

//       if (!isRateLimit || attempt === maxRetries) throw error;

//       const delay = Math.pow(2, attempt + 1) * 1000 + Math.random() * 1000;
//       console.log(
//         `Rate limited by Gemini. Retrying in ${Math.round(delay / 1000)}s... (attempt ${attempt + 1}/${maxRetries})`
//       );
//       await new Promise((res) => setTimeout(res, delay));
//     }
//   }
// };

// module.exports = retryWithBackoff;

const retryWithBackoff = async (fn, maxRetries = 5) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.log("=== GEMINI ERROR ===");
      console.log("error.status:", error?.status);
      console.log("error.statusCode:", error?.statusCode);
      console.log("error.code:", error?.code);
      console.log("error.message:", error?.message);
      console.log("error.response?.status:", error?.response?.status);
      console.log("====================");

      const msg = (error?.message || "").toLowerCase();
      const status =
        error?.status ||
        error?.statusCode ||
        error?.code ||
        error?.response?.status ||
        "";

      const isRateLimit =
        status === 429 ||
        status === "429" ||
        status === "RESOURCE_EXHAUSTED" ||
        msg.includes("429") ||
        msg.includes("quota") ||
        msg.includes("rate") ||
        msg.includes("resource_exhausted") ||
        msg.includes("too many requests") ||
        msg.includes("exhausted") ||
        msg.includes("limit");

      console.log(`Attempt ${attempt + 1} — isRateLimit: ${isRateLimit}`);

      if (!isRateLimit || attempt === maxRetries) throw error;

      // Waits: 3s, 6s, 12s, 24s, 48s
      const delay = Math.pow(2, attempt + 1) * 1500 + Math.random() * 1000;
      console.log(`Rate limited. Waiting ${Math.round(delay / 1000)}s before retry...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

module.exports = retryWithBackoff;
