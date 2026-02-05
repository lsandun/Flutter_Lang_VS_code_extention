import 'package:flutter/material.dart';

/// ===========================================================
/// FLUTTER AUTO LOCALIZER - TEST FILE
/// 
/// Format: BEFORE → AFTER (when extension is applied)
/// Example: const Text('Messages') → Text(AppLocalizations.of(context)!.messages)
/// ===========================================================

class MessagesScreen extends StatelessWidget {
  const MessagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages'),
        actions: [
          IconButton(
            icon: const Icon(Icons.video_call),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Starting video call...')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.edit_square),
            onPressed: () => _showNewMessageDialog(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search messages',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: Colors.grey[200],
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
              ),
            ),
          ),

          // Message Requests Banner
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Row(
              children: [
                Icon(Icons.mark_email_unread, color: Colors.blue),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Message Requests',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'You have 3 new message requests',
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.chevron_right),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Messages List
          Expanded(
            child: ListView(
              children: [
                _buildMessageTile(
                  name: 'Sarah Wilson',
                  lastMessage: 'That sounds great! Let me know when you are free.',
                  time: '2m',
                  unread: true,
                  online: true,
                ),
                _buildMessageTile(
                  name: 'Travel Group',
                  lastMessage: 'Mike: Has everyone booked their flights?',
                  time: '15m',
                  unread: true,
                  isGroup: true,
                ),
                _buildMessageTile(
                  name: 'John Smith',
                  lastMessage: 'Thanks for sharing that article!',
                  time: '1h',
                  online: true,
                ),
                _buildMessageTile(
                  name: 'Emma Davis',
                  lastMessage: 'See you tomorrow at the meeting.',
                  time: '3h',
                ),
                _buildMessageTile(
                  name: 'Work Team',
                  lastMessage: 'You: I will send the report by end of day.',
                  time: '5h',
                  isGroup: true,
                ),
                _buildMessageTile(
                  name: 'Alex Johnson',
                  lastMessage: 'Happy birthday! Hope you have an amazing day!',
                  time: '1d',
                ),
                _buildMessageTile(
                  name: 'Mom',
                  lastMessage: 'Call me when you get a chance.',
                  time: '2d',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageTile({
    required String name,
    required String lastMessage,
    required String time,
    bool unread = false,
    bool online = false,
    bool isGroup = false,
  }) {
    return ListTile(
      leading: Stack(
        children: [
          CircleAvatar(
            backgroundColor: isGroup ? Colors.purple : Colors.grey[300],
            child: Icon(
              isGroup ? Icons.group : Icons.person,
              color: isGroup ? Colors.white : Colors.grey[600],
            ),
          ),
          if (online)
            Positioned(
              bottom: 0,
              right: 0,
              child: Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: Colors.green,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                ),
              ),
            ),
        ],
      ),
      title: Text(
        name,
        style: TextStyle(
          fontWeight: unread ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      subtitle: Text(
        lastMessage,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          color: unread ? Colors.black87 : Colors.grey,
          fontWeight: unread ? FontWeight.w500 : FontWeight.normal,
        ),
      ),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            time,
            style: TextStyle(
              fontSize: 12,
              color: unread ? Colors.blue : Colors.grey,
            ),
          ),
          if (unread)
            Container(
              margin: const EdgeInsets.only(top: 4),
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: Colors.blue,
                shape: BoxShape.circle,
              ),
            ),
        ],
      ),
    );
  }

  void _showNewMessageDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.9,
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'New Message',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16),
            TextField(
              decoration: InputDecoration(
                hintText: 'Search for people',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Suggested',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 10),
            Expanded(
              child: ListView(
                children: const [
                  ListTile(
                    leading: CircleAvatar(child: Icon(Icons.person)),
                    title: Text('Sarah Wilson'),
                    subtitle: Text('Online now'),
                  ),
                  ListTile(
                    leading: CircleAvatar(child: Icon(Icons.person)),
                    title: Text('John Smith'),
                    subtitle: Text('Active 5 minutes ago'),
                  ),
                  ListTile(
                    leading: CircleAvatar(child: Icon(Icons.person)),
                    title: Text('Emma Davis'),
                    subtitle: Text('Active 1 hour ago'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
