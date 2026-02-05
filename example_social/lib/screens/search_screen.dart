import 'package:flutter/material.dart';

/// ===========================================================
/// FLUTTER AUTO LOCALIZER - TEST FILE
/// 
/// Format: BEFORE → AFTER (when extension is applied)
/// Example: const Text('Search') → Text(AppLocalizations.of(context)!.search)
/// ===========================================================

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  bool _showResults = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          decoration: InputDecoration(
            hintText: 'Search for people, tags, or places',
            border: InputBorder.none,
            prefixIcon: const Icon(Icons.search),
            suffixIcon: _searchController.text.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear),
                    onPressed: () {
                      _searchController.clear();
                      setState(() => _showResults = false);
                    },
                  )
                : null,
          ),
          onChanged: (value) {
            setState(() => _showResults = value.isNotEmpty);
          },
        ),
      ),
      body: _showResults ? _buildSearchResults() : _buildExploreContent(),
    );
  }

  Widget _buildExploreContent() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Categories
          Padding(
            padding: const EdgeInsets.all(16),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildCategoryChip('For You', Icons.star, Colors.orange),
                _buildCategoryChip('Travel', Icons.flight, Colors.blue),
                _buildCategoryChip('Food', Icons.restaurant, Colors.red),
                _buildCategoryChip('Fashion', Icons.checkroom, Colors.purple),
                _buildCategoryChip('Sports', Icons.sports_soccer, Colors.green),
                _buildCategoryChip('Music', Icons.music_note, Colors.pink),
                _buildCategoryChip('Art', Icons.palette, Colors.teal),
                _buildCategoryChip('Tech', Icons.computer, Colors.indigo),
              ],
            ),
          ),

          // Trending Section
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'Trending Now',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 200,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                _buildTrendingCard('Summer Vibes', '2.5M posts'),
                _buildTrendingCard('Foodie Friday', '1.8M posts'),
                _buildTrendingCard('Travel Goals', '3.2M posts'),
                _buildTrendingCard('Fitness Journey', '1.5M posts'),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Popular Hashtags
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'Popular Hashtags',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 12),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: 5,
            itemBuilder: (context, index) {
              final hashtags = [
                {'tag': '#photography', 'posts': '45.2M'},
                {'tag': '#nature', 'posts': '38.7M'},
                {'tag': '#love', 'posts': '125.3M'},
                {'tag': '#instagood', 'posts': '98.5M'},
                {'tag': '#travel', 'posts': '67.8M'},
              ];
              return ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.tag),
                ),
                title: Text(
                  hashtags[index]['tag']!,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Text('${hashtags[index]['posts']} posts'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              );
            },
          ),

          const SizedBox(height: 24),

          // Suggested Accounts
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'Suggested for You',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 12),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: 4,
            itemBuilder: (context, index) {
              final accounts = [
                {'name': 'Travel Photography', 'followers': '2.5M followers'},
                {'name': 'Healthy Recipes', 'followers': '1.8M followers'},
                {'name': 'Tech News Daily', 'followers': '3.2M followers'},
                {'name': 'Art Inspiration', 'followers': '980K followers'},
              ];
              return ListTile(
                leading: const CircleAvatar(
                  backgroundColor: Colors.grey,
                  child: Icon(Icons.person, color: Colors.white),
                ),
                title: Text(
                  accounts[index]['name']!,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Text(accounts[index]['followers']!),
                trailing: OutlinedButton(
                  onPressed: () {},
                  child: const Text('Follow'),
                ),
              );
            },
          ),

          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String label, IconData icon, Color color) {
    return ActionChip(
      avatar: Icon(icon, size: 18, color: color),
      label: Text(label),
      onPressed: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Browsing $label category')),
        );
      },
    );
  }

  Widget _buildTrendingCard(String title, String subtitle) {
    return Container(
      width: 150,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        color: Colors.grey[300],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Stack(
        children: [
          const Center(
            child: Icon(Icons.image, size: 48, color: Colors.grey),
          ),
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Colors.black54],
                ),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(12)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchResults() {
    return DefaultTabController(
      length: 4,
      child: Column(
        children: [
          const TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: 'Top'),
              Tab(text: 'Accounts'),
              Tab(text: 'Tags'),
              Tab(text: 'Places'),
            ],
          ),
          Expanded(
            child: TabBarView(
              children: [
                _buildTopResults(),
                _buildAccountResults(),
                _buildTagResults(),
                _buildPlaceResults(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopResults() {
    return ListView(
      children: [
        const Padding(
          padding: EdgeInsets.all(16),
          child: Text(
            'Recent Searches',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
        ListTile(
          leading: const Icon(Icons.history),
          title: const Text('travel photography'),
          trailing: IconButton(
            icon: const Icon(Icons.close),
            onPressed: () {},
          ),
        ),
        ListTile(
          leading: const Icon(Icons.history),
          title: const Text('sunset views'),
          trailing: IconButton(
            icon: const Icon(Icons.close),
            onPressed: () {},
          ),
        ),
        const Divider(),
        const Padding(
          padding: EdgeInsets.all(16),
          child: Text(
            'Best Matches',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
        const ListTile(
          leading: CircleAvatar(child: Icon(Icons.person)),
          title: Text('travel_photographer'),
          subtitle: Text('John Smith • 1.2M followers'),
        ),
        const ListTile(
          leading: CircleAvatar(child: Icon(Icons.tag)),
          title: Text('#travelgram'),
          subtitle: Text('25.6M posts'),
        ),
      ],
    );
  }

  Widget _buildAccountResults() {
    return ListView.builder(
      itemCount: 10,
      itemBuilder: (context, index) => const ListTile(
        leading: CircleAvatar(child: Icon(Icons.person)),
        title: Text('account_name'),
        subtitle: Text('Full Name • 100K followers'),
        trailing: OutlinedButton(
          onPressed: null,
          child: Text('Follow'),
        ),
      ),
    );
  }

  Widget _buildTagResults() {
    return ListView.builder(
      itemCount: 10,
      itemBuilder: (context, index) => const ListTile(
        leading: CircleAvatar(child: Icon(Icons.tag)),
        title: Text('#hashtag'),
        subtitle: Text('1.5M posts'),
      ),
    );
  }

  Widget _buildPlaceResults() {
    return ListView.builder(
      itemCount: 10,
      itemBuilder: (context, index) => const ListTile(
        leading: CircleAvatar(child: Icon(Icons.location_on)),
        title: Text('Location Name'),
        subtitle: Text('City, Country'),
      ),
    );
  }
}
