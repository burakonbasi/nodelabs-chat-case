import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../../../core/constants/storage_constants.dart';
import '../../../core/errors/exceptions.dart';
import '../../models/conversation_model.dart';
import '../../models/message_model.dart';

abstract class ChatLocalDataSource {
  // Database initialization
  Future<void> initDatabase();
  
  // Conversations
  Future<List<ConversationModel>> getCachedConversations();
  Future<void> cacheConversations(List<ConversationModel> conversations);
  Future<void> cacheConversation(ConversationModel conversation);
  Future<void> deleteConversationCache(String conversationId);
  
  // Messages
  Future<List<MessageModel>> getCachedMessages(String conversationId);
  Future<void> cacheMessages(String conversationId, List<MessageModel> messages);
  Future<void> cacheMessage(MessageModel message);
  Future<void> updateMessageCache(MessageModel message);
  Future<void> deleteMessageCache(String messageId);
  Future<void> deleteMessagesForConversation(String conversationId);
  
  // Clear all cache
  Future<void> clearAllCache();
}

class ChatLocalDataSourceImpl implements ChatLocalDataSource {
  Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB();
    return _database!;
  }

  Future<Database> _initDB() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, StorageConstants.databaseName);

    return await openDatabase(
      path,
      version: StorageConstants.databaseVersion,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    // Create conversations table
    await db.execute('''
      CREATE TABLE ${StorageConstants.conversationsTable} (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT,
        description TEXT,
        avatar TEXT,
        participants TEXT NOT NULL,
        adminId TEXT,
        lastMessage TEXT,
        unreadCount INTEGER DEFAULT 0,
        isPinned INTEGER DEFAULT 0,
        isMuted INTEGER DEFAULT 0,
        mutedUntil TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        settings TEXT,
        cachedAt TEXT NOT NULL
      )
    ''');

    // Create messages table
    await db.execute('''
      CREATE TABLE ${StorageConstants.messagesTable} (
        id TEXT PRIMARY KEY,
        conversationId TEXT NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        metadata TEXT,
        replyToId TEXT,
        replyTo TEXT,
        readBy TEXT,
        deliveredTo TEXT,
        createdAt TEXT NOT NULL,
        editedAt TEXT,
        isDeleted INTEGER DEFAULT 0,
        cachedAt TEXT NOT NULL,
        FOREIGN KEY (conversationId) REFERENCES ${StorageConstants.conversationsTable}(id)
      )
    ''');

    // Create indices for better performance
    await db.execute('''
      CREATE INDEX idx_messages_conversation 
      ON ${StorageConstants.messagesTable}(conversationId)
    ''');
    
    await db.execute('''
      CREATE INDEX idx_messages_created 
      ON ${StorageConstants.messagesTable}(createdAt)
    ''');
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    // Handle database migrations here
    if (oldVersion < newVersion) {
      // For now, just recreate tables
      await db.execute('DROP TABLE IF EXISTS ${StorageConstants.messagesTable}');
      await db.execute('DROP TABLE IF EXISTS ${StorageConstants.conversationsTable}');
      await _onCreate(db, newVersion);
    }
  }

  @override
  Future<void> initDatabase() async {
    await database;
  }

  @override
  Future<List<ConversationModel>> getCachedConversations() async {
    try {
      final db = await database;
      final List<Map<String, dynamic>> maps = await db.query(
        StorageConstants.conversationsTable,
        orderBy: 'updatedAt DESC',
      );

      return maps.map((map) {
        // Parse JSON fields
        final conversationMap = Map<String, dynamic>.from(map);
        conversationMap['participants'] = json.decode(map['participants']);
        if (map['lastMessage'] != null) {
          conversationMap['lastMessage'] = json.decode(map['lastMessage']);
        }
        if (map['settings'] != null) {
          conversationMap['settings'] = json.decode(map['settings']);
        }
        conversationMap['isPinned'] = map['isPinned'] == 1;
        conversationMap['isMuted'] = map['isMuted'] == 1;
        
        return ConversationModel.fromJson(conversationMap);
      }).toList();
    } catch (e) {
      throw CacheException('Failed to get cached conversations: ${e.toString()}');
    }
  }

  @override
  Future<void> cacheConversations(List<ConversationModel> conversations) async {
    try {
      final db = await database;
      final batch = db.batch();
      
      // Clear existing conversations
      batch.delete(StorageConstants.conversationsTable);
      
      // Insert new conversations
      for (final conversation in conversations) {
        batch.insert(
          StorageConstants.conversationsTable,
          _conversationToMap(conversation),
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
      
      await batch.commit(noResult: true);
    } catch (e) {
      throw CacheException('Failed to cache conversations: ${e.toString()}');
    }
  }

  @override
  Future<void> cacheConversation(ConversationModel conversation) async {
    try {
      final db = await database;
      await db.insert(
        StorageConstants.conversationsTable,
        _conversationToMap(conversation),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    } catch (e) {
      throw CacheException('Failed to cache conversation: ${e.toString()}');
    }
  }

  @override
  Future<void> deleteConversationCache(String conversationId) async {
    try {
      final db = await database;
      await db.delete(
        StorageConstants.conversationsTable,
        where: 'id = ?',
        whereArgs: [conversationId],
      );
      // Also delete associated messages
      await deleteMessagesForConversation(conversationId);
    } catch (e) {
      throw CacheException('Failed to delete conversation cache: ${e.toString()}');
    }
  }

  @override
  Future<List<MessageModel>> getCachedMessages(String conversationId) async {
    try {
      final db = await database;
      final List<Map<String, dynamic>> maps = await db.query(
        StorageConstants.messagesTable,
        where: 'conversationId = ?',
        whereArgs: [conversationId],
        orderBy: 'createdAt ASC',
      );

      return maps.map((map) {
        // Parse JSON fields
        final messageMap = Map<String, dynamic>.from(map);
        messageMap['sender'] = json.decode(map['sender']);
        if (map['metadata'] != null) {
          messageMap['metadata'] = json.decode(map['metadata']);
        }
        if (map['replyTo'] != null) {
          messageMap['replyTo'] = json.decode(map['replyTo']);
        }
        messageMap['readBy'] = json.decode(map['readBy'] ?? '[]');
        messageMap['deliveredTo'] = json.decode(map['deliveredTo'] ?? '[]');
        messageMap['isDeleted'] = map['isDeleted'] == 1;
        
        return MessageModel.fromJson(messageMap);
      }).toList();
    } catch (e) {
      throw CacheException('Failed to get cached messages: ${e.toString()}');
    }
  }

  @override
  Future<void> cacheMessages(String conversationId, List<MessageModel> messages) async {
    try {
      final db = await database;
      final batch = db.batch();
      
      // Clear existing messages for this conversation
      batch.delete(
        StorageConstants.messagesTable,
        where: 'conversationId = ?',
        whereArgs: [conversationId],
      );
      
      // Insert new messages
      for (final message in messages) {
        batch.insert(
          StorageConstants.messagesTable,
          _messageToMap(message),
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
      
      await batch.commit(noResult: true);
    } catch (e) {
      throw CacheException('Failed to cache messages: ${e.toString()}');
    }
  }

  @override
  Future<void> cacheMessage(MessageModel message) async {
    try {
      final db = await database;
      await db.insert(
        StorageConstants.messagesTable,
        _messageToMap(message),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    } catch (e) {
      throw CacheException('Failed to cache message: ${e.toString()}');
    }
  }

  @override
  Future<void> updateMessageCache(MessageModel message) async {
    try {
      final db = await database;
      await db.update(
        StorageConstants.messagesTable,
        _messageToMap(message),
        where: 'id = ?',
        whereArgs: [message.id],
      );
    } catch (e) {
      throw CacheException('Failed to update message cache: ${e.toString()}');
    }
  }

  @override
  Future<void> deleteMessageCache(String messageId) async {
    try {
      final db = await database;
      await db.delete(
        StorageConstants.messagesTable,
        where: 'id = ?',
        whereArgs: [messageId],
      );
    } catch (e) {
      throw CacheException('Failed to delete message cache: ${e.toString()}');
    }
  }

  @override
  Future<void> deleteMessagesForConversation(String conversationId) async {
    try {
      final db = await database;
      await db.delete(
        StorageConstants.messagesTable,
        where: 'conversationId = ?',
        whereArgs: [conversationId],
      );
    } catch (e) {
      throw CacheException('Failed to delete messages for conversation: ${e.toString()}');
    }
  }

  @override
  Future<void> clearAllCache() async {
    try {
      final db = await database;
      await db.delete(StorageConstants.conversationsTable);
      await db.delete(StorageConstants.messagesTable);
    } catch (e) {
      throw CacheException('Failed to clear cache: ${e.toString()}');
    }
  }

  // Helper methods
  Map<String, dynamic> _conversationToMap(ConversationModel conversation) {
    return {
      'id': conversation.id,
      'type': conversation.type.value,
      'name': conversation.name,
      'description': conversation.description,
      'avatar': conversation.avatar,
      'participants': json.encode(
        conversation.participants.map((p) => p.toJson()).toList(),
      ),
      'adminId': conversation.adminId,
      'lastMessage': conversation.lastMessage != null
          ? json.encode((conversation.lastMessage as MessageModel).toJson())
          : null,
      'unreadCount': conversation.unreadCount,
      'isPinned': conversation.isPinned ? 1 : 0,
      'isMuted': conversation.isMuted ? 1 : 0,
      'mutedUntil': conversation.mutedUntil?.toIso8601String(),
      'createdAt': conversation.createdAt.toIso8601String(),
      'updatedAt': conversation.updatedAt.toIso8601String(),
      'settings': conversation.settings != null 
          ? json.encode(conversation.settings) 
          : null,
      'cachedAt': DateTime.now().toIso8601String(),
    };
  }

  Map<String, dynamic> _messageToMap(MessageModel message) {
    return {
      'id': message.id,
      'conversationId': message.conversationId,
      'sender': json.encode((message.sender as UserModel).toJson()),
      'content': message.content,
      'type': message.type.value,
      'status': message.status.value,
      'metadata': message.metadata != null 
          ? json.encode(message.metadata) 
          : null,
      'replyToId': message.replyToId,
      'replyTo': message.replyTo != null
          ? json.encode((message.replyTo as MessageModel).toJson())
          : null,
      'readBy': json.encode(message.readBy),
      'deliveredTo': json.encode(message.deliveredTo),
      'createdAt': message.createdAt.toIso8601String(),
      'editedAt': message.editedAt?.toIso8601String(),
      'isDeleted': message.isDeleted ? 1 : 0,
      'cachedAt': DateTime.now().toIso8601String(),
    };
  }
}