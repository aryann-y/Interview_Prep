const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.includes("quota") ||
        error?.message?.includes("rate");

      if (!isRateLimit || attempt === maxRetries) throw error;

      const delay = Math.pow(2, attempt + 1) * 1000 + Math.random() * 1000;
      console.log(
        `Rate limited by Gemini. Retrying in ${Math.round(delay / 1000)}s... (attempt ${attempt + 1}/${maxRetries})`
      );
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

module.exports = retryWithBackoff;
