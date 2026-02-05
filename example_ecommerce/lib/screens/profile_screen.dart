import 'package:flutter/material.dart';

/// ===========================================================
/// PROFILE SCREEN - Test File
/// 
/// BEFORE: Hardcoded strings
/// AFTER:  AppLocalizations.of(context)!.xxx
/// ===========================================================

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        // BEFORE: const Text('My Profile')
        // AFTER:  Text(AppLocalizations.of(context)!.myProfile)
        title: const Text('My Profile'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Profile Avatar
            const CircleAvatar(
              radius: 50,
              backgroundColor: Colors.blue,
              child: Icon(Icons.person, size: 50, color: Colors.white),
            ),
            
            const SizedBox(height: 16),
            
            // BEFORE: const Text('John Doe')
            // AFTER:  Text(AppLocalizations.of(context)!.johnDoe)
            const Text(
              'John Doe',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            
            // BEFORE: const Text('john.doe@email.com')
            // AFTER:  (This is technical, may be skipped)
            const Text(
              'john.doe@email.com',
              style: TextStyle(color: Colors.grey),
            ),
            
            const SizedBox(height: 24),
            
            // Profile Info Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // BEFORE: const Text('Personal Information')
                    // AFTER:  Text(AppLocalizations.of(context)!.personalInformation)
                    const Text(
                      'Personal Information',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const Divider(),
                    _buildInfoRow(Icons.phone, 'Phone', '+1 234 567 890'),
                    _buildInfoRow(Icons.location_on, 'Location', 'New York, USA'),
                    _buildInfoRow(Icons.cake, 'Birthday', 'January 1, 1990'),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Edit Profile Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    // BEFORE: const SnackBar(content: Text('Edit profile coming soon'))
                    // AFTER:  SnackBar(content: Text(AppLocalizations.of(context)!.editProfileComingSoon))
                    const SnackBar(content: Text('Edit profile coming soon')),
                  );
                },
                icon: const Icon(Icons.edit),
                // BEFORE: const Text('Edit Profile')
                // AFTER:  Text(AppLocalizations.of(context)!.editProfile)
                label: const Text('Edit Profile'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: Colors.grey),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
              Text(value, style: const TextStyle(fontSize: 16)),
            ],
          ),
        ],
      ),
    );
  }
}
