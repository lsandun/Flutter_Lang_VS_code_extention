import 'package:flutter/material.dart';

<<<<<<< HEAD
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
=======
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('User Profile'),
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
<<<<<<< HEAD
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
=======
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Profile Avatar
              Center(
                child: Stack(
                  children: [
                    const CircleAvatar(
                      radius: 60,
                      backgroundColor: Colors.blue,
                      child: Icon(Icons.person, size: 60, color: Colors.white),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: CircleAvatar(
                        radius: 18,
                        backgroundColor: Colors.green,
                        child: IconButton(
                          icon: const Icon(Icons.camera_alt, size: 18, color: Colors.white),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Change profile picture')),
                            );
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Profile Info Header
              const Text(
                'Personal Information',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),

              // Form Fields
              TextFormField(
                initialValue: 'John Doe',
                decoration: const InputDecoration(
                  labelText: 'Full Name',
                  hintText: 'Enter your full name',
                  prefixIcon: Icon(Icons.person_outline),
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your name';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              TextFormField(
                initialValue: 'john.doe@example.com',
                decoration: const InputDecoration(
                  labelText: 'Email Address',
                  hintText: 'Enter your email address',
                  prefixIcon: Icon(Icons.email_outlined),
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your email';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              TextFormField(
                initialValue: '+94 77 123 4567',
                decoration: const InputDecoration(
                  labelText: 'Phone Number',
                  hintText: 'Enter your phone number',
                  prefixIcon: Icon(Icons.phone_outlined),
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.phone,
              ),

              const SizedBox(height: 16),

              TextFormField(
                initialValue: 'Colombo, Sri Lanka',
                decoration: const InputDecoration(
                  labelText: 'Address',
                  hintText: 'Enter your address',
                  prefixIcon: Icon(Icons.location_on_outlined),
                  border: OutlineInputBorder(),
                ),
                maxLines: 2,
              ),

              const SizedBox(height: 24),

              // Account Status Card
              Card(
                color: Colors.green.shade50,
                child: const Padding(
                  padding: EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Icon(Icons.verified, color: Colors.green),
                      SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Account Verified',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            Text(
                              'Your account has been verified successfully',
                              style: TextStyle(fontSize: 12, color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Save Button
              ElevatedButton.icon(
                onPressed: () {
                  if (_formKey.currentState!.validate()) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Profile updated successfully')),
                    );
                  }
                },
                icon: const Icon(Icons.save),
                label: const Text('Save Changes'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),

              const SizedBox(height: 12),

              // Logout Button
              OutlinedButton.icon(
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Logout'),
                      content: const Text('Are you sure you want to logout?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Cancel'),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.pop(context);
                            Navigator.pop(context);
                          },
                          child: const Text('Logout'),
                        ),
                      ],
                    ),
                  );
                },
                icon: const Icon(Icons.logout),
                label: const Text('Logout'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  foregroundColor: Colors.red,
                ),
              ),
            ],
          ),
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c
        ),
      ),
    );
  }
<<<<<<< HEAD

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
=======
>>>>>>> cfb0e08d76205e974d0ee0550368340ad92d6c0c
}
