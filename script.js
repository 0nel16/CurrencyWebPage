document.addEventListener("DOMContentLoaded", () => {
  const cardRates = document.querySelectorAll(".cardRates");

  async function updateRates() {
  try {
    const response = await fetch("/api/rates");
    const data = await response.json();
    if (!data.rates) throw new Error("No rates found in API response");

    const base = data.base; // should be EUR

    cardRates.forEach(card => {
      const pair = card.dataset.pair;
      const [from, to] = pair.split("/");

      let rate = null;

      // 1. If either currency equals the base (EUR)
      if (from === base && data.rates[to]) {
        rate = data.rates[to];
      } else if (to === base && data.rates[from]) {
        rate = 1 / data.rates[from];
      }
      // 2. Otherwise, calculate cross rate via EUR
      else if (data.rates[from] && data.rates[to]) {
        rate = data.rates[to] / data.rates[from];
      }

      if (rate) {
        const oldValue = card.textContent;
        const newValue = `${pair} ${rate.toFixed(3)}`;
          card.textContent = newValue;
          card.style.transition = "color 0.3s ease";
          card.style.color = "#4ade80";
          setTimeout(() => (card.style.color = "#f3f4f6"), 600);
      } else {
        card.textContent = `${pair} N/A`;
      }
    });
  } catch (error) {
    console.error("Error updating rates:", error);
    cardRates.forEach(card => {
      card.textContent = `${card.dataset.pair} N/A`;
    });
  }
}

  updateRates();
  setInterval(updateRates, 30000); // refresh every 30s
});