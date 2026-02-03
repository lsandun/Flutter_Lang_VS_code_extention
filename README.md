# Flutter Auto Localizer

![Built for Flutter](https://img.shields.io/badge/Built%20for-Flutter-02569B?logo=flutter) ![Version](https://img.shields.io/badge/Version-1.0.0-blue) ![VS Code](https://img.shields.io/badge/VS%20Code-Extension-007ACC?logo=visualstudiocode)

**Flutter Auto Localizer** is a complete localization toolkit for Flutter developers. It automates the entire i18n workflow: from extracting strings and generating translations to setting up language switching in your app.

---

## 🎯 What Makes This Special

Unlike other localization tools that only extract strings, Flutter Auto Localizer provides a **complete end-to-end solution**:

1. **Extract** → Automatically find and extract hard-coded strings
2. **Translate** → Instant translations to 100+ languages via Google Translate
3. **Connect** → Generate all the code needed to make language switching work in your app

---

## 🚀 Key Features

### 🔍 Automatic String Extraction
- Intelligently scans Dart files to detect hard-coded string literals
- Ignores imports, comments, and technical strings (URLs, file paths, etc.)
- **NEW:** Supports strings with placeholders (`"Hello $name"` → `"Hello {name}"`)

### 🛠️ Smart Code Transformation
- Automatically removes `const` keywords from widgets with localized strings
- Handles various widget types: `Text`, `Tooltip`, `InputDecoration`, etc.
- Adds required imports automatically

### 🌍 100+ Language Translations
- Instant translations using Google Translate API
- Deep sync: keeps all language files in perfect sync
- Rate-limited to avoid API throttling

### ⚡ Complete Setup Generation (NEW!)
- Generates `l10n.yaml` configuration
- Updates `pubspec.yaml` with required dependencies
- Creates `LocaleProvider` for state management
- Generates ready-to-use **Language Switcher Widgets**:
  - Dropdown widget
  - ListTile for settings screens
  - Bottom sheet selector

### 📦 Batch Processing (NEW!)
- Process all Dart files in your project at once
- Preview mode to see what will be extracted
- Smart filtering: excludes generated files, tests, etc.

---

## 📖 Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| **Extract & Translate** | `Ctrl+Shift+L` | Extract strings from current file and translate |
| **Generate Setup** | - | Create provider, widgets, and config files |
| **Batch Process** | - | Process all Dart files in the project |
| **Preview Strings** | - | Preview what strings will be extracted |
| **Quick Extract** | - | Extract strings without translation |

Access via Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) → Search "Flutter Auto Localizer"

---

## 🔧 Quick Start

### Step 1: Extract Strings
1. Open a Dart file with hard-coded strings
2. Press `Ctrl+Shift+L` (or run "Flutter Auto Localizer: Extract & Translate")
3. Select target languages
4. Done! Your code is now localized.

### Step 2: Generate Setup (Connect Language Switching)
1. Run "Flutter Auto Localizer: Generate Setup"
2. Follow the instructions in the generated `LOCALIZATION_SETUP.md`
3. Add the LocaleProvider to your app
4. Use the Language Switcher widget in your settings

### Step 3: Update Your main.dart

```dart
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

---

## 📁 Generated Files Structure

```
your_flutter_project/
├── lib/
│   ├── l10n/
│   │   ├── app_en.arb          # English (source)
│   │   ├── app_es.arb          # Spanish
│   │   ├── app_fr.arb          # French
│   │   └── ...
│   └── core/
│       ├── providers/
│       │   └── locale_provider.dart
│       └── widgets/
│           └── language_switcher.dart
├── l10n.yaml
├── pubspec.yaml (updated)
└── LOCALIZATION_SETUP.md
```

---

## 🎨 Language Switcher Widgets

The extension generates three ready-to-use widgets:

### 1. Dropdown (for AppBar)
```dart
AppBar(
  title: Text('Settings'),
  actions: [
    const LanguageSwitcher(),
  ],
)
```

### 2. ListTile (for Settings)
```dart
const LanguageSwitcherTile()
```

### 3. Bottom Sheet
```dart
ElevatedButton(
  onPressed: () => LanguageBottomSheet.show(context),
  child: Text('Change Language'),
)
```

---

## ⚙️ Requirements

- VS Code v1.80.0+
- Flutter SDK installed
- A Flutter project with `lib/` directory

---

## 🔄 Workflow Example

**Before:**
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

**After:**
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

**Generated `app_en.arb`:**
```json
{
  "@@locale": "en",
  "welcome": "Welcome",
  "helloWorld": "Hello World"
}
```

---

## ⚠️ Notes

- **Translation API:** Uses `google-translate-api-x` (free). Good for development; consider professional translation review for production.
- **Rate Limits:** The tool implements delays between API calls to avoid rate limiting.
- **Placeholders:** Strings with `$variable` or `${expression}` are converted to ARB placeholder format.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

## 📜 License

MIT License - Feel free to use in personal and commercial projects.

---

**Enjoy automated localization!** 🚀🌍
