FXHub — Currency Exchange Web App

FXHub is a full-stack web application that allows users to view live exchange rates, convert between currencies, and manage a personalized list of favorite currency pairs.
It’s designed as a learning project built with HTML, CSS, JavaScript, and Node.js (Express).

Features

Currency Exchange
	•	Live exchange rates fetched via the Frankfurter API.
	•	Automatic updates every 30 seconds.
	•	Clean header displaying 6 key currency pairs (EUR/USD, GBP/USD, etc.).

Currency Converter
	•	Convert between any two currencies instantly.
	•	Display of both the conversion result and the 1-to-1 exchange rate.
	•	Add selected pairs to your favorites list for quick access.

Favorites (Requires Login)
	•	Favorites are stored on the backend (favorites.txt) and persist between sessions.
	•	Each favorite can be removed individually.
	•	Clicking a favorite automatically updates the converter’s “From” and “To” values.
	•	Pop-up notifications confirm each action.

Conversion History
	•	Shows the last 10 conversions performed (session-based).
	•	Visible only when logged in.

Login / Logout System
	•	Simple username/password system (admin / admin) stored in a local login.txt file.
	•	Enables restricted sections: Favorites and Conversion History.
	•	“Log in” button becomes “Log out” dynamically after authentication.

Responsive Design
	•	Fully responsive layout using media queries:
	•	Exchange rate cards adjust or hide on smaller widths.
	•	Footer stacks vertically on mobile.
	•	Clean and minimal UI for both desktop and mobile.

Additional Pages
	•	About
	•	Contact
	•	Privacy
	•	Terms
Each page includes content, consistent header/footer, and working navigation links.

⸻

🧰 Technologies Used
Layer
Frontend
HTML5, CSS3, Vanilla JavaScript
Backend
Node.js, Express
Data Source
Frankfurter API
Storage
Text files (favorites.txt, login.txt)
Version Control
Git & GitHub

Installation & Setup

1️⃣ Clone the repository
git clone git@github.com:0nel16/CurrencyWebPage.git
cd CurrencyWebPage

2️⃣ Install dependencies
npm install express

3️⃣ Start the server
node server.js

The app runs by default at:
http://localhost:3000

Usage Guide

Login
	1.	Click Log in in the header.
	2.	Enter the credentials:
    username: admin
    password: admin

    3.	Once logged in:
	•	The Favorites sidebar and History section become visible.
	•	The button label changes to Log out.

Convert Currencies
	1.	Select your “From” and “To” currencies.
	2.	Enter an amount.
	3.	Click Convert to display the result and rate.
	4.	(Optional) Add the pair to favorites with Add to Favorites.

Manage Favorites
	•	Click a favorite to auto-load it in the converter.
	•	Click x to remove it.
	•	Favorites persist in text_files/favorites.txt.

Conversion History
	•	Tracks your 10 most recent conversions while logged in.
	•	Displays below the converter.

This project demonstrates:
	•	Understanding of HTML structure and reusable components (header/footer).
	•	Responsive design via media queries.
	•	Use of Fetch API for external data.
	•	Integration of frontend and backend using Express.
	•	Implementation of login logic, local storage, and file persistence.
	•	Clean modular code, comments, and beginner-friendly structure.

🏁 Author

Ionel Marius Preda
GitHub: @0nel16
LinkedIn: Ionel-Marius Preda