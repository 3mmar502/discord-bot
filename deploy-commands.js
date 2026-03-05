// deploy-commands.js - تسجيل أوامر Slash على Discord
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];

function loadCommandData(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      loadCommandData(fullPath);
    } else if (file.name.endsWith('.js')) {
      try {
        const command = require(fullPath);
        if (command.data) {
          commands.push(command.data.toJSON());
          console.log(`  ✅ ${command.data.name}`);
        }
      } catch (err) {
        console.error(`  ❌ خطأ في ${file.name}:`, err.message);
      }
    }
  }
}

console.log('\n📦 جمع بيانات الأوامر...');
loadCommandData(path.join(__dirname, 'commands'));

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log(`\n🔄 جاري تسجيل ${commands.length} أمر...`);

    if (process.env.GUILD_ID) {
      // تسجيل على سيرفر محدد (أسرع للاختبار)
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log(`✅ تم تسجيل الأوامر على السيرفر (GUILD)`);
    } else {
      // تسجيل عالمي (يستغرق حتى ساعة)
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      console.log('✅ تم تسجيل الأوامر بشكل عالمي');
    }

    console.log('\n📋 الأوامر المسجلة:');
    commands.forEach(cmd => console.log(`  /${cmd.name}`));

  } catch (err) {
    console.error('❌ فشل تسجيل الأوامر:', err.message);
  }
})();
