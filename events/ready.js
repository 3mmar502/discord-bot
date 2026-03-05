// events/ready.js
const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`\n✅ البوت يعمل الآن: ${client.user.tag}`);
    console.log(`📊 متصل بـ ${client.guilds.cache.size} سيرفر`);
    console.log(`👥 يخدم ${client.users.cache.size} مستخدم`);
    console.log('─'.repeat(40));

    // تعيين النشاط
    const activities = [
      { name: '🛡️ أحمي السيرفر', type: ActivityType.Watching },
      { name: '⚙️ /مساعدة', type: ActivityType.Listening },
      { name: `📊 ${client.guilds.cache.size} سيرفر`, type: ActivityType.Watching },
    ];

    let i = 0;
    const setActivity = () => {
      const activity = activities[i % activities.length];
      client.user.setActivity(activity.name, { type: activity.type });
      i++;
    };

    setActivity();
    setInterval(setActivity, 30000); // تغيير كل 30 ثانية
  },
};
