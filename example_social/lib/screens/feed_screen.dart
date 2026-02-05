import 'package:flutter/material.dart';
import 'messages_screen.dart';
import 'notifications_screen.dart';
import 'profile_screen.dart';
import 'search_screen.dart';

/// ===========================================================
/// FLUTTER AUTO LOCALIZER - TEST FILE
/// 
/// Format: BEFORE → AFTER (when extension is applied)
/// ===========================================================

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        // BEFORE: const Text('Social Connect')
        // AFTER:  Text(AppLocalizations.of(context)!.socialConnect)
        title: const Text('Social Connect'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_box_outlined),
            onPressed: () => _showCreatePostDialog(),
            // BEFORE: tooltip: 'Create Post'
            // AFTER:  tooltip: AppLocalizations.of(context)!.createPost
            tooltip: 'Create Post',
          ),
          IconButton(
            icon: const Icon(Icons.favorite_border),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const NotificationsScreen()),
            ),
            tooltip: 'Notifications',
          ),
          IconButton(
            icon: const Icon(Icons.message_outlined),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const MessagesScreen()),
            ),
            tooltip: 'Messages',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Refreshing your feed...')),
          );
          await Future.delayed(const Duration(seconds: 1));
        },
        child: ListView(
          children: [
            // Stories Section
            _buildStoriesSection(),

            const Divider(height: 1),

            // Posts
            _buildPost(
              username: 'john_doe',
              location: 'New York, USA',
              caption: 'Beautiful sunset at Central Park! The colors were absolutely amazing today.',
              likes: 1234,
              comments: 89,
              timeAgo: '2 hours ago',
            ),
            _buildPost(
              username: 'travel_adventures',
              location: 'Paris, France',
              caption: 'Living my best life in Paris! The Eiffel Tower never gets old.',
              likes: 5678,
              comments: 234,
              timeAgo: '5 hours ago',
            ),
            _buildPost(
              username: 'foodie_life',
              location: 'Tokyo, Japan',
              caption: 'Best ramen I have ever had! You must try this place when you visit Tokyo.',
              likes: 3456,
              comments: 156,
              timeAgo: '8 hours ago',
            ),
            _buildPost(
              username: 'fitness_guru',
              location: 'Los Angeles, USA',
              caption: 'Morning workout complete! Remember, consistency is key to success.',
              likes: 2345,
              comments: 78,
              timeAgo: '12 hours ago',
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          if (index == 1) {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const SearchScreen()));
          } else if (index == 4) {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen()));
          } else {
            setState(() => _currentIndex = index);
          }
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
          BottomNavigationBarItem(icon: Icon(Icons.add_circle_outline), label: 'Create'),
          BottomNavigationBarItem(icon: Icon(Icons.favorite_border), label: 'Activity'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildStoriesSection() {
    return SizedBox(
      height: 110,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
        children: [
          _buildStoryItem('Your Story', isAddStory: true),
          _buildStoryItem('John'),
          _buildStoryItem('Sarah'),
          _buildStoryItem('Mike'),
          _buildStoryItem('Emma'),
          _buildStoryItem('Alex'),
          _buildStoryItem('Lisa'),
        ],
      ),
    );
  }

  Widget _buildStoryItem(String name, {bool isAddStory = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Column(
        children: [
          Stack(
            children: [
              Container(
                width: 65,
                height: 65,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: isAddStory
                      ? null
                      : const LinearGradient(
                          colors: [Colors.purple, Colors.orange],
                        ),
                ),
                padding: const EdgeInsets.all(2),
                child: CircleAvatar(
                  backgroundColor: Colors.grey[300],
                  child: Icon(
                    isAddStory ? Icons.add : Icons.person,
                    color: Colors.grey[600],
                  ),
                ),
              ),
              if (isAddStory)
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: const BoxDecoration(
                      color: Colors.blue,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.add, color: Colors.white, size: 14),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            name,
            style: const TextStyle(fontSize: 12),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildPost({
    required String username,
    required String location,
    required String caption,
    required int likes,
    required int comments,
    required String timeAgo,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Post Header
        ListTile(
          leading: const CircleAvatar(
            backgroundColor: Colors.grey,
            child: Icon(Icons.person, color: Colors.white),
          ),
          title: Text(username, style: const TextStyle(fontWeight: FontWeight.bold)),
          subtitle: Text(location),
          trailing: IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () => _showPostOptions(),
          ),
        ),

        // Post Image Placeholder
        Container(
          height: 300,
          width: double.infinity,
          color: Colors.grey[300],
          child: const Center(
            child: Icon(Icons.image, size: 64, color: Colors.grey),
          ),
        ),

        // Action Buttons
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.favorite_border),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('You liked this post')),
                  );
                },
              ),
              IconButton(
                icon: const Icon(Icons.chat_bubble_outline),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Opening comments...')),
                  );
                },
              ),
              IconButton(
                icon: const Icon(Icons.send_outlined),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Share this post')),
                  );
                },
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.bookmark_border),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Post saved to collection')),
                  );
                },
              ),
            ],
          ),
        ),

        // Likes
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            '$likes likes',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ),

        // Caption
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: RichText(
            text: TextSpan(
              style: DefaultTextStyle.of(context).style,
              children: [
                TextSpan(
                  text: '$username ',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                TextSpan(text: caption),
              ],
            ),
          ),
        ),

        // Comments
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'View all $comments comments',
            style: TextStyle(color: Colors.grey[600]),
          ),
        ),

        // Time
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: Text(
            timeAgo,
            style: TextStyle(color: Colors.grey[500], fontSize: 12),
          ),
        ),

        const SizedBox(height: 8),
      ],
    );
  }

  void _showCreatePostDialog() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Create New Post',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Choose from Gallery'),
              subtitle: const Text('Select photos from your device'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Take a Photo'),
              subtitle: const Text('Capture a new moment'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.videocam),
              title: const Text('Record Video'),
              subtitle: const Text('Create a short video'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.text_fields),
              title: const Text('Write a Story'),
              subtitle: const Text('Share your thoughts'),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }

  void _showPostOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.report),
              title: const Text('Report Post'),
              subtitle: const Text('This post is inappropriate'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.block),
              title: const Text('Block User'),
              subtitle: const Text('Stop seeing posts from this user'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.visibility_off),
              title: const Text('Hide Post'),
              subtitle: const Text('See fewer posts like this'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.copy),
              title: const Text('Copy Link'),
              subtitle: const Text('Copy link to this post'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.share),
              title: const Text('Share to Other Apps'),
              subtitle: const Text('Share this post externally'),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }
}
