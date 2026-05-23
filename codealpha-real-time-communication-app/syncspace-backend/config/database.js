const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'syncspace',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

const connectDB = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    conn.release();
    await initializeSchema();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   Make sure XAMPP MySQL is running and DB "syncspace" exists.');
    process.exit(1);
  }
};

const initializeSchema = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      display_name VARCHAR(100),
      avatar_url VARCHAR(255),
      role ENUM('user','admin') DEFAULT 'user',
      is_online BOOLEAN DEFAULT FALSE,
      last_seen TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS meetings (
      id VARCHAR(36) PRIMARY KEY,
      room_id VARCHAR(20) UNIQUE NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      host_id VARCHAR(36) NOT NULL,
      password VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      max_participants INT DEFAULT 50,
      scheduled_at TIMESTAMP NULL,
      started_at TIMESTAMP NULL,
      ended_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS participants (
      id VARCHAR(36) PRIMARY KEY,
      meeting_id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      role ENUM('host','co-host','participant') DEFAULT 'participant',
      is_muted BOOLEAN DEFAULT FALSE,
      is_video_off BOOLEAN DEFAULT FALSE,
      is_screen_sharing BOOLEAN DEFAULT FALSE,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      left_at TIMESTAMP NULL,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(36) PRIMARY KEY,
      meeting_id VARCHAR(36) NOT NULL,
      sender_id VARCHAR(36) NOT NULL,
      content TEXT NOT NULL,
      type ENUM('text','file','system','emoji') DEFAULT 'text',
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS shared_files (
      id VARCHAR(36) PRIMARY KEY,
      meeting_id VARCHAR(36) NOT NULL,
      uploader_id VARCHAR(36) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      stored_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      mime_type VARCHAR(100),
      file_size BIGINT,
      download_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
      FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS whiteboard_data (
      id VARCHAR(36) PRIMARY KEY,
      meeting_id VARCHAR(36) NOT NULL UNIQUE,
      canvas_data LONGTEXT,
      last_updated_by VARCHAR(36),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      type ENUM('meeting_invite','user_joined','user_left','file_shared','message') NOT NULL,
      title VARCHAR(200) NOT NULL,
      body TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
  ];

  try {
    for (const query of queries) {
      await pool.execute(query);
    }
    console.log('✅ Database schema initialized');
  } catch (err) {
    console.error('❌ Schema initialization error:', err.message);
    throw err;
  }
};

module.exports = { pool, connectDB };
