import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

/// ===========================================================
/// SIMPLE TEST APP - Flutter Auto Localizer Extension
/// 
/// Developer's code BEFORE using the extension.
/// Run "Flutter L10n: Auto Localize" to extract all strings!
/// ===========================================================

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      // BEFORE: title: 'My First App'
      // AFTER:  title: AppLocalizations.of(context)!.myFirstApp
      title: 'My First App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}
