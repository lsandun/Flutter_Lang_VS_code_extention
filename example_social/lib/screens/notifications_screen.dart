import 'package:flutter/material.dart';

/// ===========================================================
/// FLUTTER AUTO LOCALIZER - TEST FILE
/// 
/// Format: BEFORE → AFTER (when extension is applied)
/// Example: const Text('Notifications') → Text(AppLocalizations.of(context)!.notifications)
/// ===========================================================

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Activity'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'All'),
              Tab(text: 'Mentions'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // All Notifications Tab
            ListView(
              children: [
                _buildSectionHeader('Today'),
                _buildNotification(
                  type: NotificationType.like,
                  username: 'sarah_wilson',
                  action: 'liked your photo',
                  time: '2m ago',
                ),
                _buildNotification(
                  type: NotificationType.comment,
                  username: 'john_doe',
                  action: 'commented on your post',
                  detail: 'This is amazing!',
                  time: '15m ago',
                ),
                _buildNotification(
                  type: NotificationType.follow,
                  username: 'travel_adventures',
                  action: 'started following you',
                  time: '1h ago',
                  showFollowButton: true,
                ),
                _buildNotification(
                  type: NotificationType.like,
                  username: 'emma_davis and 24 others',
                  action: 'liked your photo',
                  time: '2h ago',
                ),
                _buildSectionHeader('This Week'),
                _buildNotification(
                  type: NotificationType.mention,
                  username: 'mike_johnson',
                  action: 'mentioned you in a comment',
                  detail: 'Check out @you for more travel tips!',
                  time: '2d ago',
                ),
                _buildNotification(
                  type: NotificationType.follow,
                  username: 'photography_club',
                  action: 'started following you',
                  time: '3d ago',
                  showFollowButton: true,
                ),
                _buildNotification(
                  type: NotificationType.like,
                  username: 'alex_smith and 156 others',
                  action: 'liked your reel',
                  time: '4d ago',
                ),
                _buildSectionHeader('This Month'),
                _buildNotification(
                  type: NotificationType.comment,
                  username: 'lisa_brown',
                  action: 'replied to your comment',
                  detail: 'I totally agree with you!',
                  time: '1w ago',
                ),
                _buildNotification(
                  type: NotificationType.follow,
                  username: 'food_lovers',
                  action: 'started following you',
                  time: '2w ago',
                  showFollowButton: true,
                ),
              ],
            ),

            // Mentions Tab
            ListView(
              children: [
                _buildNotification(
                  type: NotificationType.mention,
                  username: 'mike_johnson',
                  action: 'mentioned you in a comment',
                  detail: 'Check out @you for more travel tips!',
                  time: '2d ago',
                ),
                _buildNotification(
                  type: NotificationType.mention,
                  username: 'sarah_wilson',
                  action: 'mentioned you in their story',
                  time: '5d ago',
                ),
                _buildNotification(
                  type: NotificationType.mention,
                  username: 'travel_group',
                  action: 'mentioned you in a post',
                  detail: 'Had an amazing trip with @you!',
                  time: '1w ago',
                ),
                const SizedBox(height: 100),
                const Center(
                  child: Column(
                    children: [
                      Icon(Icons.alternate_email, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text(
                        'No more mentions',
                        style: TextStyle(fontSize: 16, color: Colors.grey),
                      ),
                      Text(
                        'When someone mentions you, it will appear here',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title,
        style: const TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 16,
        ),
      ),
    );
  }

  Widget _buildNotification({
    required NotificationType type,
    required String username,
    required String action,
    String? detail,
    required String time,
    bool showFollowButton = false,
  }) {
    IconData icon;
    Color iconColor;

    switch (type) {
      case NotificationType.like:
        icon = Icons.favorite;
        iconColor = Colors.red;
        break;
      case NotificationType.comment:
        icon = Icons.chat_bubble;
        iconColor = Colors.blue;
        break;
      case NotificationType.follow:
        icon = Icons.person_add;
        iconColor = Colors.purple;
        break;
      case NotificationType.mention:
        icon = Icons.alternate_email;
        iconColor = Colors.orange;
        break;
    }

    return ListTile(
      leading: Stack(
        children: [
          const CircleAvatar(
            backgroundColor: Colors.grey,
            child: Icon(Icons.person, color: Colors.white),
          ),
          Positioned(
            bottom: -2,
            right: -2,
            child: Container(
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                color: iconColor,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
              child: Icon(icon, size: 12, color: Colors.white),
            ),
          ),
        ],
      ),
      title: RichText(
        text: TextSpan(
          style: const TextStyle(color: Colors.black),
          children: [
            TextSpan(
              text: username,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            TextSpan(text: ' $action'),
          ],
        ),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (detail != null)
            Text(
              detail,
              style: const TextStyle(color: Colors.grey),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          Text(
            time,
            style: const TextStyle(color: Colors.grey, fontSize: 12),
          ),
        ],
      ),
      trailing: showFollowButton
          ? ElevatedButton(
              onPressed: () {},
              child: const Text('Follow'),
            )
          : Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Icon(Icons.image, color: Colors.grey),
            ),
    );
  }
}

enum NotificationType { like, comment, follow, mention }
