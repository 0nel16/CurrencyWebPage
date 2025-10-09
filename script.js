const cardRates = document.querySelectorAll(".cardRates");

async function updateRates() {
  try {
    const response = await fetch("/api/rates");
    const data = await response.json();
    if (!data.rates) throw new Error("No rates found in API response");

    const base = data.base; // should be EUR

    cardRates.forEach((card) => {
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
        const newValue = `${pair} ${rate.toFixed(2)}`;
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
    cardRates.forEach((card) => {
      card.textContent = `${card.dataset.pair} N/A`;
    });
  }
}

updateRates();
setInterval(updateRates, 30000); // refresh every 30s

// ----- Currency Converter -----
// --- Currency Converter Exchange Rate Display Logic ---
async function updateExchangeRate() {
  const from = document.getElementById("fromCurrency").value;
  const to = document.getElementById("toCurrency").value;
  const exchangeRateDisplay = document.querySelector(".exchangeRateDisplay p");

  try {
    const response = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
    const data = await response.json();

    if (!data.rates || !data.rates[to]) {
      exchangeRateDisplay.textContent = "Unable to fetch rate.";
      return;
    }

    const rate = data.rates[to];
    exchangeRateDisplay.textContent = `1 ${from} = ${rate.toFixed(2)} ${to}`;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    exchangeRateDisplay.textContent = "Error fetching rate.";
  }
}

document.getElementById("fromCurrency").addEventListener("change", updateExchangeRate);
document.getElementById("toCurrency").addEventListener("change", updateExchangeRate);
document.getElementById("convertBtn").addEventListener("click", async () => {
  const from = document.getElementById("fromCurrency").value;
  const to = document.getElementById("toCurrency").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const resultText = document.getElementById("resultText");
  const exchangeRateDisplay = document.querySelector(".exchangeRateDisplay p");

  if (!amount || amount <= 0) {
    resultText.textContent = "⚠️ Please enter a valid amount.";
    return;
  }

  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${from}&to=${to}`
    );
    const data = await response.json();

    if (!data.rates || !data.rates[to]) {
      resultText.textContent = "Unable to fetch conversion.";
      return;
    }

    const rate = data.rates[to];
    const converted = amount * rate;

    exchangeRateDisplay.textContent = `1 ${from} = ${rate.toFixed(2)} ${to}`;
    resultText.textContent = `${amount} ${from} = ${converted.toFixed(2)} ${to}`;
  } catch (error) {
    console.error("Error fetching conversion rate:", error);
    resultText.textContent = "Conversion failed. Please try again.";
  }
});

updateExchangeRate();

let favoritesList = document.querySelector(".favoritesList");
let addFavoriteBtn = document.getElementById("addFavoriteBtn");

function loadFavorites() {
    fetch("/favorites/list")
    .then(function (res){ return res.json(); })
    .then(function (data) {
        favoritesList.innerHTML = "";
        data.forEach(function (pair) {
            addFavoriteToDom(pair);
        });
    });
}

function addFavoriteToDom(pair) {
    showPopup("✅ Added to favorites!");
    let item = document.createElement("div");
    item.classList.add("favoriteItem");
    item.innerHTML = '<span>' + pair + '</span> <button class="removeBtn">x</button>';

        // When clicking anywhere on the favorite (except the remove button)
    item.addEventListener("click", function (event) {
        // Ignore clicks on the remove button
        if (event.target.classList.contains("removeBtn")) return;

        let parts = pair.split("/");
        let fromCurrency = document.getElementById("fromCurrency");
        let toCurrency = document.getElementById("toCurrency");

        fromCurrency.value = parts[0];
        toCurrency.value = parts[1];

        updateExchangeRate();

        let converterBox = document.querySelector(".converter");
        converterBox.style.transition = "background-color 0.4s ease";
        converterBox.style.backgroundColor = "rgba(76, 175, 80, 0.15";
        setTimeout(function() {
            converterBox.style.backgroundColor = "";
            showPopup("🔁 Pair selected for conversion!");
        }, 400);
    })

    let removeBtn = item.querySelector(".removeBtn");
    removeBtn.addEventListener("click", function () {
        fetch("/favorites", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pair: pair})
        })
            .then(function () {
                item.remove(); 
                showPopup("❌ Favorite removed!");
            });
    })

    favoritesList.appendChild(item);
}

addFavoriteBtn.addEventListener("click", function () {
    let from = document.getElementById("fromCurrency").value;
    let to = document.getElementById("toCurrency").value;
    let pair = from + "/" + to;

    fetch("/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pair: pair })
    })
        .then(function () {
            addFavoriteToDom(pair);
        });
});

loadFavorites();

function showPopup(message) {
  const container = document.getElementById("popupContainer");

  // Create a new popup element
  const popup = document.createElement("div");
  popup.classList.add("popupMessage");
  popup.textContent = message;

  container.appendChild(popup);

  // Show animation
  setTimeout(() => popup.classList.add("show"), 10);

  // Auto-remove after 2s
  setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => popup.remove(), 300);
  }, 2000);

  // Keep only last 3 visible popups
  const popups = container.querySelectorAll(".popupMessage");
  if (popups.length > 3) {
    popups[0].remove();
  }
}
