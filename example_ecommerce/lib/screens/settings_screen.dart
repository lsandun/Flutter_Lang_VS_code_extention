import 'package:flutter/material.dart';

<<<<<<< HEAD
/// ===========================================================
/// SETTINGS SCREEN - Test File
/// 
/// BEFORE: Hardcoded strings
/// AFTER:  AppLocalizations.of(context)!.xxx
/// 
/// NOTE: Line 17 has a FIELD INITIALIZER that will be SKIPPED
/// by the extension (context not available there)
/// ===========================================================

=======
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _darkMode = false;
  bool _notifications = true;
<<<<<<< HEAD
  
  // FIELD INITIALIZER - Will be SKIPPED (no context available)
  String _language = 'English';
=======
  bool _emailUpdates = true;
  String _selectedLanguage = 'English';
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
<<<<<<< HEAD
        // BEFORE: const Text('Settings')
        // AFTER:  Text(AppLocalizations.of(context)!.settings)
=======
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c
        title: const Text('Settings'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: ListView(
        children: [
<<<<<<< HEAD
          // BEFORE: _buildSectionTitle('Appearance')
          // AFTER:  _buildSectionTitle(AppLocalizations.of(context)!.appearance)
          _buildSectionTitle('Appearance'),
          
          SwitchListTile(
            // BEFORE: const Text('Dark Mode')
            // AFTER:  Text(AppLocalizations.of(context)!.darkMode)
            title: const Text('Dark Mode'),
            // BEFORE: const Text('Enable dark theme')
            // AFTER:  Text(AppLocalizations.of(context)!.enableDarkTheme)
=======
          // Appearance Section
          _buildSectionHeader('Appearance'),

          SwitchListTile(
            title: const Text('Dark Mode'),
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c
            subtitle: const Text('Enable dark theme'),
            value: _darkMode,
            onChanged: (value) => setState(() => _darkMode = value),
            secondary: const Icon(Icons.dark_mode),
          ),
<<<<<<< HEAD
          
          ListTile(
            leading: const Icon(Icons.language),
            // BEFORE: const Text('Language')
            // AFTER:  Text(AppLocalizations.of(context)!.language)
            title: const Text('Language'),
            subtitle: Text(_language),
            trailing: const Icon(Icons.arrow_forward_ios),
            onTap: () => _showLanguageDialog(),
          ),
          
          const Divider(),
          
          // BEFORE: _buildSectionTitle('Notifications')
          // AFTER:  _buildSectionTitle(AppLocalizations.of(context)!.notifications)
          _buildSectionTitle('Notifications'),
          
          SwitchListTile(
            // BEFORE: const Text('Push Notifications')
            // AFTER:  Text(AppLocalizations.of(context)!.pushNotifications)
            title: const Text('Push Notifications'),
            // BEFORE: const Text('Receive push notifications')
            // AFTER:  Text(AppLocalizations.of(context)!.receivePushNotifications)
=======

          ListTile(
            leading: const Icon(Icons.language),
            title: const Text('Language'),
            subtitle: Text(_selectedLanguage),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () => _showLanguageDialog(),
          ),

          const Divider(),

          // Notifications Section
          _buildSectionHeader('Notifications'),

          SwitchListTile(
            title: const Text('Push Notifications'),
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c
            subtitle: const Text('Receive push notifications'),
            value: _notifications,
            onChanged: (value) => setState(() => _notifications = value),
            secondary: const Icon(Icons.notifications),
          ),
<<<<<<< HEAD
          
          const Divider(),
          
          // BEFORE: _buildSectionTitle('About')
          // AFTER:  _buildSectionTitle(AppLocalizations.of(context)!.about)
          _buildSectionTitle('About'),
          
          ListTile(
            leading: const Icon(Icons.info),
            // BEFORE: const Text('App Version')
            // AFTER:  Text(AppLocalizations.of(context)!.appVersion)
            title: const Text('App Version'),
            subtitle: const Text('1.0.0'),
          ),
          
          ListTile(
            leading: const Icon(Icons.help),
            // BEFORE: const Text('Help & Support')
            // AFTER:  Text(AppLocalizations.of(context)!.helpSupport)
            title: const Text('Help & Support'),
            trailing: const Icon(Icons.arrow_forward_ios),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                // BEFORE: const SnackBar(content: Text('Opening help center'))
                // AFTER:  SnackBar(content: Text(AppLocalizations.of(context)!.openingHelpCenter))
                const SnackBar(content: Text('Opening help center')),
              );
            },
          ),
=======

          SwitchListTile(
            title: const Text('Email Updates'),
            subtitle: const Text('Receive email newsletters'),
            value: _emailUpdates,
            onChanged: (value) => setState(() => _emailUpdates = value),
            secondary: const Icon(Icons.email),
          ),

          const Divider(),

          // Privacy Section
          _buildSectionHeader('Privacy & Security'),

          ListTile(
            leading: const Icon(Icons.lock),
            title: const Text('Change Password'),
            subtitle: const Text('Update your password'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Opening password settings')),
              );
            },
          ),

          ListTile(
            leading: const Icon(Icons.privacy_tip),
            title: const Text('Privacy Policy'),
            subtitle: const Text('Read our privacy policy'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Opening privacy policy')),
              );
            },
          ),

          ListTile(
            leading: const Icon(Icons.description),
            title: const Text('Terms of Service'),
            subtitle: const Text('Read our terms'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Opening terms of service')),
              );
            },
          ),

          const Divider(),

          // Support Section
          _buildSectionHeader('Support'),

          ListTile(
            leading: const Icon(Icons.help),
            title: const Text('Help Center'),
            subtitle: const Text('Get help and support'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {},
          ),

          ListTile(
            leading: const Icon(Icons.feedback),
            title: const Text('Send Feedback'),
            subtitle: const Text('Help us improve'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {},
          ),

          ListTile(
            leading: const Icon(Icons.info),
            title: const Text('About'),
            subtitle: const Text('Version 1.0.0'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              showAboutDialog(
                context: context,
                applicationName: 'Localization Demo',
                applicationVersion: '1.0.0',
                applicationLegalese: 'Copyright 2024. All rights reserved.',
              );
            },
          ),

          const Divider(),

          // Danger Zone
          _buildSectionHeader('Account'),

          ListTile(
            leading: const Icon(Icons.delete_forever, color: Colors.red),
            title: const Text(
              'Delete Account',
              style: TextStyle(color: Colors.red),
            ),
            subtitle: const Text('Permanently delete your account'),
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Delete Account'),
                  content: const Text(
                    'Are you sure you want to delete your account? This action cannot be undone.',
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Delete', style: TextStyle(color: Colors.red)),
                    ),
                  ],
                ),
              );
            },
          ),

          const SizedBox(height: 32),
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c
        ],
      ),
    );
  }

<<<<<<< HEAD
  Widget _buildSectionTitle(String title) {
=======
  Widget _buildSectionHeader(String title) {
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: Theme.of(context).colorScheme.primary,
        ),
      ),
    );
  }

  void _showLanguageDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
<<<<<<< HEAD
        // BEFORE: const Text('Select Language')
        // AFTER:  Text(AppLocalizations.of(context)!.selectLanguage)
=======
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c
        title: const Text('Select Language'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildLanguageOption('English'),
            _buildLanguageOption('Spanish'),
            _buildLanguageOption('French'),
            _buildLanguageOption('German'),
<<<<<<< HEAD
=======
            _buildLanguageOption('Japanese'),
            _buildLanguageOption('Chinese'),
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c
          ],
        ),
      ),
    );
  }

  Widget _buildLanguageOption(String language) {
    return ListTile(
      title: Text(language),
<<<<<<< HEAD
      trailing: _language == language ? const Icon(Icons.check, color: Colors.green) : null,
      onTap: () {
        setState(() => _language = language);
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          // BEFORE: SnackBar(content: Text('Language changed to $language'))
          // AFTER:  SnackBar(content: Text(AppLocalizations.of(context)!.languageChangedTo(language)))
=======
      trailing: _selectedLanguage == language
          ? const Icon(Icons.check, color: Colors.green)
          : null,
      onTap: () {
        setState(() => _selectedLanguage = language);
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c
          SnackBar(content: Text('Language changed to $language')),
        );
      },
    );
  }
}
