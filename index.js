// index.js - نقطة البداية الرئيسية
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { initDatabase } = require('./database/database');

// التحقق من المتغيرات المطلوبة
if (!process.env.BOT_TOKEN) {
  console.error('❌ خطأ: BOT_TOKEN غير موجود في ملف .env');
  process.exit(1);
}

// إنشاء الـ Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

client.commands = new Collection();

// ===================================
// تحميل الأوامر
// ===================================
function loadCommands(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      loadCommands(fullPath);
    } else if (file.name.endsWith('.js')) {
      try {
        const command = require(fullPath);
        if (command.data && command.execute) {
          client.commands.set(command.data.name, command);
          console.log(`  ✅ أمر محمّل: /${command.data.name}`);
        }
      } catch (err) {
        console.error(`  ❌ خطأ في تحميل ${file.name}:`, err.message);
      }
    }
  }
}

console.log('\n📦 تحميل الأوامر...');
loadCommands(path.join(__dirname, 'commands'));

// ===================================
// تحميل الأحداث
// ===================================
console.log('\n📡 تحميل الأحداث...');
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  console.log(`  ✅ حدث محمّل: ${event.name}`);
}

// ===================================
// تهيئة قاعدة البيانات
// ===================================
console.log('\n🗄️ تهيئة قاعدة البيانات...');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
initDatabase();

// ===================================
// معالجة الأخطاء غير المتوقعة
// ===================================
process.on('unhandledRejection', err => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
});

process.on('uncaughtException', err => {
  console.error('❌ Uncaught Exception:', err.message);
});

// ===================================
// تشغيل البوت
// ===================================
console.log('\n🚀 تشغيل البوت...');
client.login(process.env.BOT_TOKEN);
