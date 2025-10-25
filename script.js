// Select all elements in the header showing live exchange rates - example USD/EUR
const cardRates = document.querySelectorAll(".cardRates");

const loginModal = document.getElementById("loginModal");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");
const accountBtn = document.getElementById("btnAccount");

// Log in handler
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const username = document.getElementById("loginUser").value;
    const password = document.getElementById("loginPass").value;

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        loginMessage.textContent = "✅ Logged in successfully!";
        localStorage.setItem("fxhubLoggedIn", "true");
        showPopup("🔓 Favorites unlocked!");
        setTimeout(() => (window.location.href = "index.html"), 1000);
      } else {
        loginMessage.textContent = "❌ Invalid credentials.";
      }
    } catch (error) {
      console.error("Login error:", error);
      loginMessage.textContent = "Server error.";
    }
  });
}

// Close modal when clicking outside of it
loginModal?.addEventListener("click", (e) => {
  if (e.target === loginModal) loginModal.classList.add("hidden");
});

// Update the button from "Log in" to "Log out"
function updateAccountButton() {
  if (!accountBtn) return;
  const isLoggedIn = localStorage.getItem("fxhubLoggedIn") === "true";
  accountBtn.textContent = isLoggedIn ? "Log out" : "Log in";
}

// Log out handler
function handleLogout() {
  localStorage.removeItem("fxhubLoggedIn");
  document
    .querySelectorAll(".restricted")
    .forEach((el) => el.classList.remove("show"));
  showPopup("🔒 Logged out successfully!");
  updateAccountButton();
}

// Account button behaviour
if (accountBtn) {
  accountBtn.addEventListener("click", () => {
    const isLoggedIn = localStorage.getItem("fxhubLoggedIn") === "true";
    if (isLoggedIn) {
      handleLogout();
    } else {
      loginModal.classList.remove("hidden"); // show login popup
    }
  });
}

// Initial state on page load
if (localStorage.getItem("fxhubLoggedIn") === "true") {
  document
    .querySelectorAll(".restricted")
    .forEach((el) => el.classList.add("show"));
}
updateAccountButton();

//Fetches the latest exchange rates from local node server endpoint api rates
async function updateRates() {
  try {
    //Retrieves data from the Frankfurter API
    const response = await fetch("/api/rates");
    const data = await response.json();
    if (!data.rates) throw new Error("No rates found in API response");

    const base = data.base; // should be EUR

    //Loop every .cardRates elements and determine what pair it represents
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
        //When the rate updates succesfully, text color flashes green for 0.6s
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

//Currency Converter Exchange Rate Display Logic
async function updateExchangeRate() {
  const from = document.getElementById("fromCurrency").value;
  const to = document.getElementById("toCurrency").value;
  const exchangeRateDisplay = document.querySelector(".exchangeRateDisplay p");

  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${from}&to=${to}`
    );
    const data = await response.json();

    //If the API don't provide valid rates data or does not include the selected currency, show an error.
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

document
  .getElementById("fromCurrency")
  .addEventListener("change", updateExchangeRate);
document
  .getElementById("toCurrency")
  .addEventListener("change", updateExchangeRate);
document.getElementById("convertBtn").addEventListener("click", async () => {
  const from = document.getElementById("fromCurrency").value;
  const to = document.getElementById("toCurrency").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const resultText = document.getElementById("resultText");
  const exchangeRateDisplay = document.querySelector(".exchangeRateDisplay p");

  if (!amount || amount <= 0) {
    resultText.textContent = "Please enter a valid amount.";
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
    resultText.textContent = `${amount} ${from} = ${converted.toFixed(
      2
    )} ${to}`;
    // --- Log conversion to history if logged in ---
    if (localStorage.getItem("fxhubLoggedIn") === "true") {
      const historyList = document.getElementById("historyList");
      const listItem = document.createElement("li");
      const timestamp = new Date().toLocaleTimeString();
      listItem.textContent = `${timestamp} — ${amount} ${from} → ${converted.toFixed(
        2
      )} ${to}`;
      historyList.prepend(listItem); // latest first

      // Keep only last 10 entries
      if (historyList.children.length > 10) {
        historyList.removeChild(historyList.lastChild);
      }
    }
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
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      favoritesList.innerHTML = "";
      data.forEach(function (pair) {
        addFavoriteToDom(pair, false);
      });
    });
}

function addFavoriteToDom(pair, showPopupMessage = false) {
  if (showPopupMessage) showPopup("✅ Added to favorites!");
  let item = document.createElement("div");
  item.classList.add("favoriteItem");
  item.innerHTML =
    "<span>" + pair + '</span> <button class="removeBtn">x</button>';

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
    setTimeout(function () {
      converterBox.style.backgroundColor = "";
      showPopup("🔁 Pair selected for conversion!");
    }, 400);
  });

  let removeBtn = item.querySelector(".removeBtn");
  removeBtn.addEventListener("click", function () {
    fetch("/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pair: pair }),
    }).then(function () {
      item.remove();
      showPopup("❌ Favorite removed!");
    });
  });

  favoritesList.appendChild(item);
}

addFavoriteBtn.addEventListener("click", function () {
  let from = document.getElementById("fromCurrency").value;
  let to = document.getElementById("toCurrency").value;
  let pair = from + "/" + to;

  fetch("/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pair: pair }),
  }).then(function () {
    addFavoriteToDom(pair, true);
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
  }, 6000);

  // Keep only last 3 visible popups
  const popups = container.querySelectorAll(".popupMessage");
  if (popups.length > 3) {
    popups[0].remove();
  }
}
