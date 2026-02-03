# Flutter Auto Localizer

![Built for Flutter](https://img.shields.io/badge/Built%20for-Flutter-02569B?logo=flutter)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![VS Code](https://img.shields.io/badge/VS%20Code-Extension-007ACC?logo=visualstudiocode)
![Languages](https://img.shields.io/badge/Languages-100+-green)

> **The complete Flutter localization toolkit that saves you hours of manual work!**

Flutter Auto Localizer automates the entire i18n workflow: extract strings, translate to 100+ languages, and generate language switcher widgets - all from within VS Code.

---

## 🎬 Demo

![Demo GIF](images/demo.gif)

*Extract strings → Translate → Switch languages - all automated!*

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **🔍 Extract Strings** | Automatically find and extract hard-coded strings from Dart files |
| **🌍 100+ Languages** | Instant translations via Google Translate API |
| **📄 Page by Page** | Localize one page at a time with preview and error handling |
| **📦 Batch Processing** | Process all Dart files in your project at once |
| **⚙️ Setup Generator** | Generate LocaleProvider, Language Switcher widgets, and config files |
| **📊 Status Report** | See localization progress across your project |
| **🛠️ Smart const Removal** | Automatically handles `const` keyword removal |

---

## 🚀 Quick Start

### Step 1: Extract Strings
```
Press Ctrl+Shift+L (Cmd+Shift+L on Mac)
```
Or right-click in a Dart file → **Flutter L10n: Extract Strings**

### Step 2: Translate
```
Press Ctrl+Shift+T (Cmd+Shift+T on Mac)
```
Select target languages and watch the magic happen!

### Step 3: Generate Setup
Run **Flutter L10n: Generate Setup** to create:
- `l10n.yaml` configuration
- `LocaleProvider` for state management
- Ready-to-use **Language Switcher widgets**

---

## 📖 Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| **Extract Strings** | `Ctrl+Shift+L` | Extract strings from current file |
| **Translate** | `Ctrl+Shift+T` | Translate ARB to selected languages |
| **Page by Page** | - | Localize one page at a time |
| **Batch All Files** | - | Process entire project |
| **Generate Setup** | - | Create provider, widgets, config |
| **Show Status** | - | View localization progress |
| **Preview** | - | Preview extractable strings |

Access via: `Ctrl+Shift+P` → Type "Flutter L10n"

---

## 🔧 Setup Instructions

### 1. Install Dependencies
After running "Generate Setup", add these packages:
```bash
flutter pub add provider shared_preferences
flutter pub get
```

### 2. Update main.dart
```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'core/providers/locale_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final localeProvider = LocaleProvider();
  await localeProvider.loadSavedLocale();

  runApp(
    ChangeNotifierProvider.value(
      value: localeProvider,
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<LocaleProvider>(
      builder: (context, localeProvider, child) {
        return MaterialApp(
          locale: localeProvider.locale,
          supportedLocales: AppLocalizations.supportedLocales,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          home: const HomeScreen(),
        );
      },
    );
  }
}
```

### 3. Add Language Switcher
```dart
// Option 1: Dropdown
const LanguageSwitcher()

// Option 2: ListTile for Settings
const LanguageSwitcherTile()

// Option 3: Bottom Sheet
LanguageBottomSheet.show(context)
```

---

## 📁 Project Structure After Setup

```
your_project/
├── lib/
│   ├── l10n/
│   │   ├── app_en.arb          # English (source)
│   │   ├── app_es.arb          # Spanish
│   │   ├── app_si.arb          # Sinhala
│   │   └── ...                 # Other languages
│   └── core/
│       ├── providers/
│       │   └── locale_provider.dart
│       └── widgets/
│           └── language_switcher.dart
├── l10n.yaml
└── LOCALIZATION_SETUP.md       # Detailed instructions
```

---

## 🔄 Workflow Example

### Before:
```dart
class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Welcome')),
      body: const Text('Hello World'),
    );
  }
}
```

### After:
```dart
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(AppLocalizations.of(context)!.welcome)),
      body: Text(AppLocalizations.of(context)!.helloWorld),
    );
  }
}
```

### Generated ARB Files:
**app_en.arb:**
```json
{
  "@@locale": "en",
  "welcome": "Welcome",
  "helloWorld": "Hello World"
}
```

**app_si.arb:**
```json
{
  "@@locale": "si",
  "welcome": "ආයුබෝවන්",
  "helloWorld": "හෙලෝ වර්ල්ඩ්"
}
```

---

## 🧪 Example App

A complete example Flutter app is included in the `example_app/` directory with:
- 4 screens (Home, Profile, Shop, Settings)
- 100+ localizable strings
- Ready to test the extension

```bash
cd example_app
flutter pub get
flutter run
```

---

## ⚠️ Important Notes

- **Translation API:** Uses `google-translate-api-x` (free). Good for development; consider professional review for production.
- **Rate Limiting:** Built-in delays prevent API throttling.
- **Placeholders:** Supports `$variable` and `${expression}` syntax.
- **Source of Truth:** `app_en.arb` is always the master reference.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

MIT License - Feel free to use in personal and commercial projects.

---

## 🙏 Acknowledgments

- Built with TypeScript and VS Code Extension API
- Translation powered by Google Translate
- Inspired by the Flutter community's need for easier localization

---

**Made with ❤️ for Flutter Developers**

*If this extension saves you time, consider giving it a ⭐ on GitHub!*
