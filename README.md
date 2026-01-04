# Flutter Auto Localizer

![Built for Flutter](https://img.shields.io/badge/Built%20for-Flutter-02569B?logo=flutter) ![Version](https://img.shields.io/badge/Version-0.0.1-blue) ![VS Code](https://img.shields.io/badge/VS%20Code-Extension-007ACC?logo=visualstudiocode)

**Flutter Auto Localizer** is a powerful VS Code extension designed to automate the internationalization (i18n) process for Flutter applications. It drastically reduces development time by automatically extracting hard-coded strings, managing ARB files, and providing instant, automated translations for over 100 languages.

---

## 🚀 Key Features

*   **🔍 Automatic String Extraction**
    *   Intelligently scans your Dart files (`.dart`) to detect hard-coded string literals inside Widgets.
    *   Ignores imports, comments, and strings with interpolation to ensure only relevant text is localized.

*   **🛠️ Smart `const` Removal**
    *   Automatically detects strings wrapped in `const` widgets (e.g., `const Text('Hello')`).
    *   Safely removes the `const` keyword (converting to `Text(AppLocalizations...)`) to prevent Flutter syntax errors, as localized strings are runtime values.

*   **📦 Auto Import**
    *   Automatically adds the required `import 'package:flutter_gen/gen_l10n/app_localizations.dart';` (or your specific path) to files where localization occurs.

*   **🌍 Automated Translation & Sync**
    *   **Google Translate Integration:** Instantly translates extracted strings into multiple target languages using a free translation API.
    *   **Deep Sync:** Keeps your `app_en.arb` (source of truth) and other locale files (e.g., `app_es.arb`) in perfect sync. If a key exists in English but is missing in Spanish, it will be automatically translated and added.

*   **⚡ ARB Management**
    *   Generates clean, camelCase keys (e.g., "Hello World" -> `helloWorld`).
    *   Updates existing ARB files without overwriting manual changes to other keys.

---

## 📖 How to Use

1.  **Open Project:** Open your Flutter project in VS Code.
2.  **Start Extension:**
    *   Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
    *   Run: **`Flutter Auto Localizer: Start`**.
3.  **Select Languages:**
    *   A list of languages will appear. The extension smart-detects existing ARB files in `lib/l10n/` and pre-selects them.
    *   Select the languages you want to translate to/update.
4.  **Watch the Magic:**
    *   The extension will scan your code, extract strings, update ARB files, translate missing keys, and replace the code in your editor with `AppLocalizations.of(context)!.key`.

---

## ⚙️ Extension Settings & Requirements

*   **Requirements:**
    *   VS Code v1.80.0+
    *   Flutter SDK installed and configured.
*   **Settings:**
    *   The extension automatically looks for `lib/l10n/app_en.arb` as the **Source of Truth**. Please ensure this directory structure exists or is configured in your `l10n.yaml`.
    *   Target ARB files (e.g., `app_fr.arb`) will be created in the same directory if they don't exist.

---

## ⚠️ Disclaimer

This tool is a **University Final Year Research Project**.

*   **Translation API:** It uses a free endpoint for Google Translate (`google-translate-api-x`). It is suitable for development and drafting but arguably not for production-grade professional translation without verification.
*   **Rate Limits:** While the tool implements batching and delays, heavy usage might trigger temporary rate limits from the translation provider.

---

**Enjoy coding with automated localization!** 🚀
