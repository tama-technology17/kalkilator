  ## 📚 Kalkulayor – Premium Calculator & Utilities

  A single‑page web app that combines a stylish calculator, an
  interactive calendar, and a currency converter (powered by a free
  public API).
  All features are protected behind Google Sign‑In and the UI is
  fully responsive with a modern glass‑morphism design, dark mode,
  hamburger menu, and a fullscreen toggle.
  ──────
  ### ✨ Features

   Feature            │ Description
  ────────────────────┼─────────────────────────────────────────────
   Google Auth        │ Secure sign‑in with Google Identity
                      │ Services. Session persists via
                      │ localStorage.
   Protected Routes   │ Access to calculator, calendar, and
                      │ converter only after login.
   Responsive UI      │ Mobile‑first layout, sidebar with hamburger
                      │ menu, fullscreen button.                          Calculator         │ Full arithmetic support, history,
                      │ percentage, square, inverse, etc.
   Calendar           │ Interactive month navigation, today
                      │ highlight, leap‑year aware.
   Currency Converter │ Searchable dropdowns (code, name, country),                          │ live rates from https://open.er-
                      │ api.com/v6/latest/USD, swap button,
                      │ formatted results.
   Full‑Screen Mode   │ Toggle button expands app to true
                      │ fullscreen.
   Premium Design     │ Glass‑morphism, subtle micro‑animations,
                      │ custom fonts (Outfit), dark gradient
                      │ background.
  ──────
  ### 📂 Project Structure

    kalkulayor/
    │
    ├─ index.html          # Main HTML page (SPA)
    ├─ style.css          # Global styles, custom dropdown,
  glass‑morphism, responsive layout
    ├─ script.js          # Core logic (auth, calculator, calendar,
  converter, UI toggles)
    └─ README.md          # <‑‑ you are reading it! 🎉
    ──────
  ### 🚀 Getting Started

  1. Clone the repo (or copy the files into your web server root)
    git clone <repo-url>
    cd kalkulayor

  2. Open index.html in any modern browser. No build step needed –
  pure HTML/CSS/JS.
  3. Configure Google Client ID
  Replace the placeholder in index.html (YOUR_GOOGLE_CLIENT_ID_HERE)
  with your real client ID from the Google Cloud Console.
  4. Enjoy!
      • Click Login → use your Google account.
      • Use the hamburger to open the sidebar.
      • Switch between Kalkulator, Kalender, and Mata Uang.
      • Click the fullscreen button (top‑right) for immersive view.

  ──────
  ### 📦 Deployment Tips

  • Host on any static‑file server (GitHub Pages, Netlify, Vercel,
  etc.).
  • Ensure the site is served over HTTPS (required for Google
  Sign‑In).
  • For production, you may want to set a custom domain and enable
  CSP headers.                                                           ──────
  ### 🛠️ Development

  • Edit UI → modify style.css.
  • Add new logic → extend script.js.
  • Add new pages → create a new <div class="wrapper hidden"
  id="new-app"> and add a corresponding (data-target) button in the
  sidebar.

  All UI changes automatically respect the existing glass‑morphism
  theme, thanks to CSS variables defined at the top of style.css.        ──────
  ### 🙏 Acknowledgements

  • Google Identity Services – for secure authentication.
  • ExchangeRate‑API – free public API used for live currency rates.
  • Iconography & fonts – Google Material Icons, Outfit font from
  Google Fonts.
  ──────
  ### 📜 License

  This project is MIT licensed – feel free to fork, modify, and
  publish. 🎉
  ──────
  Happy coding and enjoy your premium web calculator!
