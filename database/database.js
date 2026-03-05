// database/database.js
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/bot.db'));

function initDatabase() {
  // جدول المستخدمين - XP والعملات
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      coins INTEGER DEFAULT 0,
      messages INTEGER DEFAULT 0,
      voice_time INTEGER DEFAULT 0,
      last_daily TEXT DEFAULT NULL,
      last_message TEXT DEFAULT NULL,
      PRIMARY KEY (user_id, guild_id)
    )
  `);

  // جدول العقوبات
  db.exec(`
    CREATE TABLE IF NOT EXISTS punishments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      moderator_id TEXT NOT NULL,
      type TEXT NOT NULL,
      reason TEXT NOT NULL,
      duration INTEGER DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT DEFAULT NULL,
      active INTEGER DEFAULT 1
    )
  `);

  // جدول إعدادات السيرفر
  db.exec(`
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,
      log_join_leave TEXT DEFAULT NULL,
      log_links TEXT DEFAULT NULL,
      log_messages TEXT DEFAULT NULL,
      log_ban TEXT DEFAULT NULL,
      log_kick TEXT DEFAULT NULL,
      log_mute TEXT DEFAULT NULL,
      log_voice TEXT DEFAULT NULL,
      log_channels TEXT DEFAULT NULL,
      log_roles TEXT DEFAULT NULL,
      log_bots TEXT DEFAULT NULL,
      log_security TEXT DEFAULT NULL,
      ticket_category TEXT DEFAULT NULL,
      mute_role TEXT DEFAULT NULL,
      mod_role TEXT DEFAULT NULL,
      admin_role TEXT DEFAULT NULL
    )
  `);

  // جدول الـ Whitelist للبوتات
  db.exec(`
    CREATE TABLE IF NOT EXISTS bot_whitelist (
      bot_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      added_by TEXT NOT NULL,
      added_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (bot_id, guild_id)
    )
  `);

  // جدول التذاكر
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id TEXT UNIQUE NOT NULL,
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      claimed_by TEXT DEFAULT NULL,
      status TEXT DEFAULT 'open',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // جدول المتجر
  db.exec(`
    CREATE TABLE IF NOT EXISTS shop_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price INTEGER NOT NULL,
      role_id TEXT DEFAULT NULL,
      type TEXT DEFAULT 'role'
    )
  `);

  console.log('✅ قاعدة البيانات جاهزة');
}

// دوال المستخدمين
function getUser(userId, guildId) {
  let user = db.prepare('SELECT * FROM users WHERE user_id = ? AND guild_id = ?').get(userId, guildId);
  if (!user) {
    db.prepare('INSERT INTO users (user_id, guild_id) VALUES (?, ?)').run(userId, guildId);
    user = db.prepare('SELECT * FROM users WHERE user_id = ? AND guild_id = ?').get(userId, guildId);
  }
  return user;
}

function updateUser(userId, guildId, data) {
  const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), userId, guildId];
  db.prepare(`UPDATE users SET ${sets} WHERE user_id = ? AND guild_id = ?`).run(...values);
}

function addXP(userId, guildId, amount) {
  const user = getUser(userId, guildId);
  const newXp = user.xp + amount;
  const newLevel = Math.floor(0.1 * Math.sqrt(newXp)) + 1;
  const leveledUp = newLevel > user.level;
  db.prepare('UPDATE users SET xp = ?, level = ?, messages = messages + 1 WHERE user_id = ? AND guild_id = ?')
    .run(newXp, newLevel, userId, guildId);
  return { leveledUp, newLevel, newXp };
}

function addCoins(userId, guildId, amount) {
  db.prepare('UPDATE users SET coins = coins + ? WHERE user_id = ? AND guild_id = ?').run(amount, userId, guildId);
}

function removeCoins(userId, guildId, amount) {
  const user = getUser(userId, guildId);
  if (user.coins < amount) return false;
  db.prepare('UPDATE users SET coins = coins - ? WHERE user_id = ? AND guild_id = ?').run(amount, userId, guildId);
  return true;
}

function getLeaderboard(guildId, limit = 10) {
  return db.prepare('SELECT * FROM users WHERE guild_id = ? ORDER BY xp DESC LIMIT ?').all(guildId, limit);
}

function getRank(userId, guildId) {
  const users = db.prepare('SELECT user_id FROM users WHERE guild_id = ? ORDER BY xp DESC').all(guildId);
  return users.findIndex(u => u.user_id === userId) + 1;
}

// دوال العقوبات
function addPunishment(data) {
  return db.prepare(`
    INSERT INTO punishments (guild_id, user_id, moderator_id, type, reason, duration, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(data.guildId, data.userId, data.moderatorId, data.type, data.reason, data.duration || null, data.expiresAt || null);
}

function getUserPunishments(userId, guildId) {
  return db.prepare('SELECT * FROM punishments WHERE user_id = ? AND guild_id = ? ORDER BY created_at DESC').all(userId, guildId);
}

function getPunishmentStats(userId, guildId) {
  const punishments = getUserPunishments(userId, guildId);
  return {
    warnings: punishments.filter(p => p.type === 'warning').length,
    mutes: punishments.filter(p => p.type === 'mute').length,
    timeouts: punishments.filter(p => p.type === 'timeout').length,
    kicks: punishments.filter(p => p.type === 'kick').length,
    bans: punishments.filter(p => p.type === 'ban').length,
  };
}

// إعدادات السيرفر
function getGuildSettings(guildId) {
  let settings = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId);
  if (!settings) {
    db.prepare('INSERT INTO guild_settings (guild_id) VALUES (?)').run(guildId);
    settings = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId);
  }
  return settings;
}

function updateGuildSettings(guildId, data) {
  const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), guildId];
  db.prepare(`UPDATE guild_settings SET ${sets} WHERE guild_id = ?`).run(...values);
}

// Whitelist البوتات
function isBotWhitelisted(botId, guildId) {
  return !!db.prepare('SELECT * FROM bot_whitelist WHERE bot_id = ? AND guild_id = ?').get(botId, guildId);
}

function addBotToWhitelist(botId, guildId, addedBy) {
  db.prepare('INSERT OR IGNORE INTO bot_whitelist (bot_id, guild_id, added_by) VALUES (?, ?, ?)').run(botId, guildId, addedBy);
}

function removeBotFromWhitelist(botId, guildId) {
  db.prepare('DELETE FROM bot_whitelist WHERE bot_id = ? AND guild_id = ?').run(botId, guildId);
}

// التذاكر
function createTicket(channelId, guildId, userId) {
  return db.prepare('INSERT INTO tickets (channel_id, guild_id, user_id) VALUES (?, ?, ?)').run(channelId, guildId, userId);
}

function getTicket(channelId) {
  return db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(channelId);
}

function updateTicket(channelId, data) {
  const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), channelId];
  db.prepare(`UPDATE tickets SET ${sets} WHERE channel_id = ?`).run(...values);
}

module.exports = {
  db,
  initDatabase,
  getUser,
  updateUser,
  addXP,
  addCoins,
  removeCoins,
  getLeaderboard,
  getRank,
  addPunishment,
  getUserPunishments,
  getPunishmentStats,
  getGuildSettings,
  updateGuildSettings,
  isBotWhitelisted,
  addBotToWhitelist,
  removeBotFromWhitelist,
  createTicket,
  getTicket,
  updateTicket,
};
