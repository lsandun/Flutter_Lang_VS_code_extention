import 'package:flutter/material.dart';
import 'profile_screen.dart';
import 'settings_screen.dart';
<<<<<<< HEAD

/// ===========================================================
/// HOME SCREEN - Test File
/// 
/// BEFORE: Hardcoded strings
/// AFTER:  AppLocalizations.of(context)!.xxx
/// ===========================================================
=======
import 'shop_screen.dart';
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
<<<<<<< HEAD
        // BEFORE: const Text('Welcome')
        // AFTER:  Text(AppLocalizations.of(context)!.welcome)
        title: const Text('Welcome'),
=======
        title: const Text('Welcome to Our App'),
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
<<<<<<< HEAD
            // Hero Card
=======
            // Hero Section
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const Icon(Icons.language, size: 64, color: Colors.blue),
                    const SizedBox(height: 16),
<<<<<<< HEAD
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
=======
                    const Text(
                      'Hello, World!',
                      style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'This is a demo application to showcase the Flutter Auto Localizer extension.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 16, color: Colors.grey),
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c
                    ),
                  ],
                ),
              ),
            ),
<<<<<<< HEAD
            
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
=======

            const SizedBox(height: 24),

            // Navigation Cards
            const Text(
              'Explore Features',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            _buildNavCard(
              context,
              icon: Icons.person,
              title: 'User Profile',
              subtitle: 'View and edit your profile information',
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ProfileScreen()),
              ),
            ),

            _buildNavCard(
              context,
              icon: Icons.shopping_cart,
              title: 'Shop',
              subtitle: 'Browse our amazing products',
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ShopScreen()),
              ),
            ),

            _buildNavCard(
              context,
              icon: Icons.settings,
              title: 'Settings',
              subtitle: 'Customize your app experience',
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SettingsScreen()),
              ),
            ),

            const SizedBox(height: 24),

            // Footer
            const Center(
              child: Text(
                'Made with love using Flutter',
                style: TextStyle(color: Colors.grey),
              ),
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c
            ),
          ],
        ),
      ),
    );
  }
<<<<<<< HEAD
=======

  Widget _buildNavCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Theme.of(context).colorScheme.primaryContainer,
          child: Icon(icon, color: Theme.of(context).colorScheme.primary),
        ),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.arrow_forward_ios),
        onTap: onTap,
      ),
    );
  }
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c
}
