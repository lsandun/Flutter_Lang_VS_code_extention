import 'package:flutter/material.dart';
import 'profile_screen.dart';
import 'settings_screen.dart';

/// ===========================================================
/// HOME SCREEN - Test File
/// 
/// BEFORE: Hardcoded strings
/// AFTER:  AppLocalizations.of(context)!.xxx
/// ===========================================================

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        // BEFORE: const Text('Welcome')
        // AFTER:  Text(AppLocalizations.of(context)!.welcome)
        title: const Text('Welcome'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Hero Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const Icon(Icons.language, size: 64, color: Colors.blue),
                    const SizedBox(height: 16),
                    // BEFORE: const Text('Hello World!')
                    // AFTER:  Text(AppLocalizations.of(context)!.helloWorld)
                    const Text(
                      'Hello World!',
                      style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    // BEFORE: const Text('Welcome to the localization demo app')
                    // AFTER:  Text(AppLocalizations.of(context)!.welcomeToTheLocalizationDemoApp)
                    const Text(
                      'Welcome to the localization demo app',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // BEFORE: const Text('Navigation')
            // AFTER:  Text(AppLocalizations.of(context)!.navigation)
            const Text(
              'Navigation',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            
            // Profile Card
            Card(
              child: ListTile(
                leading: const CircleAvatar(child: Icon(Icons.person)),
                // BEFORE: const Text('My Profile')
                // AFTER:  Text(AppLocalizations.of(context)!.myProfile)
                title: const Text('My Profile'),
                // BEFORE: const Text('View and edit your information')
                // AFTER:  Text(AppLocalizations.of(context)!.viewAndEditYourInformation)
                subtitle: const Text('View and edit your information'),
                trailing: const Icon(Icons.arrow_forward_ios),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ProfileScreen()),
                ),
              ),
            ),
            
            const SizedBox(height: 8),
            
            // Settings Card
            Card(
              child: ListTile(
                leading: const CircleAvatar(child: Icon(Icons.settings)),
                // BEFORE: const Text('Settings')
                // AFTER:  Text(AppLocalizations.of(context)!.settings)
                title: const Text('Settings'),
                // BEFORE: const Text('Customize your app')
                // AFTER:  Text(AppLocalizations.of(context)!.customizeYourApp)
                subtitle: const Text('Customize your app'),
                trailing: const Icon(Icons.arrow_forward_ios),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SettingsScreen()),
                ),
              ),
            ),
            
            const SizedBox(height: 24),
            
            ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  // BEFORE: const SnackBar(content: Text('Button pressed!'))
                  // AFTER:  SnackBar(content: Text(AppLocalizations.of(context)!.buttonPressed))
                  const SnackBar(content: Text('Button pressed!')),
                );
              },
              // BEFORE: const Text('Click Me')
              // AFTER:  Text(AppLocalizations.of(context)!.clickMe)
              child: const Text('Click Me'),
            ),
          ],
        ),
      ),
    );
  }
}
