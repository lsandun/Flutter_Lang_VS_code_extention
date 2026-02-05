import 'package:flutter/material.dart';

/// ===========================================================
/// SETTINGS SCREEN - Test File
/// 
/// BEFORE: Hardcoded strings
/// AFTER:  AppLocalizations.of(context)!.xxx
/// 
/// NOTE: Line 17 has a FIELD INITIALIZER that will be SKIPPED
/// by the extension (context not available there)
/// ===========================================================

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _darkMode = false;
  bool _notifications = true;
  
  // FIELD INITIALIZER - Will be SKIPPED (no context available)
  String _language = 'English';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        // BEFORE: const Text('Settings')
        // AFTER:  Text(AppLocalizations.of(context)!.settings)
        title: const Text('Settings'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: ListView(
        children: [
          // BEFORE: _buildSectionTitle('Appearance')
          // AFTER:  _buildSectionTitle(AppLocalizations.of(context)!.appearance)
          _buildSectionTitle('Appearance'),
          
          SwitchListTile(
            // BEFORE: const Text('Dark Mode')
            // AFTER:  Text(AppLocalizations.of(context)!.darkMode)
            title: const Text('Dark Mode'),
            // BEFORE: const Text('Enable dark theme')
            // AFTER:  Text(AppLocalizations.of(context)!.enableDarkTheme)
            subtitle: const Text('Enable dark theme'),
            value: _darkMode,
            onChanged: (value) => setState(() => _darkMode = value),
            secondary: const Icon(Icons.dark_mode),
          ),
          
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
            subtitle: const Text('Receive push notifications'),
            value: _notifications,
            onChanged: (value) => setState(() => _notifications = value),
            secondary: const Icon(Icons.notifications),
          ),
          
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
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
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
        // BEFORE: const Text('Select Language')
        // AFTER:  Text(AppLocalizations.of(context)!.selectLanguage)
        title: const Text('Select Language'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildLanguageOption('English'),
            _buildLanguageOption('Spanish'),
            _buildLanguageOption('French'),
            _buildLanguageOption('German'),
          ],
        ),
      ),
    );
  }

  Widget _buildLanguageOption(String language) {
    return ListTile(
      title: Text(language),
      trailing: _language == language ? const Icon(Icons.check, color: Colors.green) : null,
      onTap: () {
        setState(() => _language = language);
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          // BEFORE: SnackBar(content: Text('Language changed to $language'))
          // AFTER:  SnackBar(content: Text(AppLocalizations.of(context)!.languageChangedTo(language)))
          SnackBar(content: Text('Language changed to $language')),
        );
      },
    );
  }
}
