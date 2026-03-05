# 🤖 البوت العربي الاحترافي - Arabic Discord Bot

بوت ديسكورد احترافي متكامل مبني بـ Node.js و discord.js v14، مصمم للسيرفرات العربية الكبيرة.

---

## 📋 قائمة الأوامر

### 🛡️ أوامر الإدارة (Moderation)
| الأمر | الوصف | الصلاحية المطلوبة |
|-------|--------|------------------|
| `/اسكات @عضو` | إسكات كتابي مع Dropdown للمدة والسبب | Moderate Members |
| `/ميوت @عضو` | كتم صوتي مع Dropdown للمدة والسبب | Mute Members |
| `/باند @عضو` | حظر مع Dropdown للسبب | Ban Members |
| `/طرد @عضو [سبب]` | طرد عضو | Kick Members |
| `/تحذير @عضو [سبب]` | تحذير عضو | Moderate Members |
| `/فك_الاسكات @عضو` | رفع الإسكات الكتابي | Moderate Members |
| `/فك_الميوت @عضو` | رفع الكتم الصوتي | Mute Members |
| `/فك_الباند [ID]` | رفع الحظر | Ban Members |
| `/سجل @عضو` | عرض سجل العقوبات | Moderate Members |
| `/قفل` | قفل الشاتات مع خيارات النطاق والوقت | Manage Channels |
| `/فتح` | فتح الشاتات | Manage Channels |

### 📊 أوامر النشاط واللفل
| الأمر | الوصف |
|-------|--------|
| `/نشاط [@عضو]` | عرض المستوى، XP، الرسائل، الفويس، الترتيب |

### 💰 أوامر الاقتصاد
| الأمر | الوصف |
|-------|--------|
| `/رصيدي [@عضو]` | عرض الرصيد والمستوى |
| `/تحويل @عضو [مبلغ]` | تحويل عملات لعضو |
| `/يومي` | مكافأة يومية (100 عملة) |
| `/متجر` | عرض متجر السيرفر |

### 🎮 أوامر الألعاب
| الأمر | الوصف |
|-------|--------|
| `/حجرة_ورقة_مقص` | لعبة حجرة ورقة مقص |
| `/tictactoe @عضو` | لعبة XO |
| `/نرد [تخمين] [رهان]` | رمي النرد |
| `/عملة [رهان]` | رمي العملة |
| `/تخمين` | تخمين رقم سري |
| `/سؤال` | سؤال عام لربح عملات |

### 🎫 نظام التذاكر
| الأمر | الوصف |
|-------|--------|
| `/تذكرة [موضوع]` | فتح تذكرة دعم |

---

## 🔧 طريقة التشغيل خطوة بخطوة

### الخطوة 1: إنشاء البوت على Discord

1. افتح [Discord Developer Portal](https://discord.com/developers/applications)
2. اضغط **New Application** وسمّه
3. من قائمة **Bot**:
   - اضغط **Add Bot**
   - فعّل **MESSAGE CONTENT INTENT**
   - فعّل **SERVER MEMBERS INTENT**
   - فعّل **PRESENCE INTENT**
4. انسخ **Token** واحتفظ به
5. انسخ **Application ID** من قسم **General Information**

### الخطوة 2: تثبيت المتطلبات

```bash
# تأكد من تثبيت Node.js v18+
node --version

# ادخل لمجلد المشروع
cd arabic-discord-bot

# ثبّت المكتبات
npm install
```

### الخطوة 3: إعداد ملف .env

```bash
# انسخ ملف المثال
cp .env.example .env
```

افتح ملف `.env` وأدخل بياناتك:

```env
BOT_TOKEN=توكن_البوت_من_Developer_Portal
CLIENT_ID=معرف_التطبيق
GUILD_ID=معرف_السيرفر_للاختبار

# روم اللوقات (انسخ ID كل روم)
LOG_JOIN_LEAVE=000000000000000000
LOG_LINKS=000000000000000000
LOG_MESSAGES=000000000000000000
LOG_BAN=000000000000000000
LOG_KICK=000000000000000000
LOG_MUTE=000000000000000000
LOG_VOICE=000000000000000000
LOG_CHANNELS=000000000000000000
LOG_ROLES=000000000000000000
LOG_BOTS=000000000000000000
LOG_SECURITY=000000000000000000

TICKET_CATEGORY_ID=معرف_كاتيجوري_التذاكر
```

### الخطوة 4: تسجيل أوامر Slash

```bash
node deploy-commands.js
```

### الخطوة 5: تشغيل البوت

```bash
node index.js
```

أو للتشغيل الدائم مع pm2:
```bash
npm install -g pm2
pm2 start index.js --name "arabic-bot"
pm2 save
pm2 startup
```

---

## 🔗 رابط دعوة البوت (OAuth2)

افتح الرابط التالي وغيّر `CLIENT_ID` بمعرف بوتك:

```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

### الصلاحيات المطلوبة (Permissions)
البوت يحتاج الصلاحيات التالية:
- ✅ Administrator (مُوصى به للتشغيل الكامل)

أو يدوياً:
- Manage Roles
- Manage Channels
- Kick Members
- Ban Members
- Moderate Members
- Mute Members
- View Audit Log
- Send Messages
- Manage Messages
- Read Message History
- View Channel

---

## 🗂️ هيكلة الملفات

```
arabic-discord-bot/
├── index.js                    ← نقطة البداية
├── deploy-commands.js          ← تسجيل الأوامر
├── package.json
├── .env                        ← إعداداتك (لا ترفعه!)
├── .env.example                ← مثال الإعداد
│
├── commands/
│   ├── moderation/             ← أوامر الإدارة
│   │   ├── اسكات.js
│   │   ├── ميوت.js
│   │   ├── باند.js
│   │   ├── طرد.js
│   │   ├── تحذير.js
│   │   ├── فك_الاسكات.js
│   │   ├── فك_الميوت.js
│   │   ├── فك_الباند.js
│   │   ├── سجل.js
│   │   ├── قفل.js
│   │   └── فتح.js
│   ├── economy/                ← الاقتصاد
│   │   ├── رصيدي.js
│   │   ├── تحويل.js
│   │   ├── يومي.js
│   │   └── متجر.js
│   ├── games/                  ← الألعاب
│   │   ├── حجرة_ورقة_مقص.js
│   │   ├── tictactoe.js
│   │   ├── نرد.js
│   │   ├── عملة.js
│   │   ├── تخمين.js
│   │   └── سؤال.js
│   ├── tickets/                ← نظام التذاكر
│   │   └── تذكرة.js
│   └── utility/                ← أوامر عامة
│       └── نشاط.js
│
├── events/                     ← الأحداث
│   ├── ready.js
│   ├── interactionCreate.js
│   ├── messageCreate.js
│   ├── messageDelete.js
│   ├── guildMemberAdd.js
│   ├── guildMemberRemove.js
│   ├── voiceStateUpdate.js
│   └── guildAuditLogEntryCreate.js
│
├── database/
│   └── database.js             ← SQLite
│
├── utils/
│   ├── embeds.js               ← مساعد Embeds
│   ├── permissions.js          ← فحص الصلاحيات
│   └── logger.js               ← إرسال اللوقات
│
└── data/
    └── bot.db                  ← قاعدة البيانات (تُنشأ تلقائياً)
```

---

## 🗃️ قاعدة البيانات (SQLite)

تُنشأ تلقائياً في `data/bot.db` وتحتوي:

| الجدول | الغرض |
|--------|--------|
| `users` | XP، coins، messages، voice_time، last_daily |
| `punishments` | سجل كامل لكل العقوبات |
| `guild_settings` | معرفات روم اللوقات والإعدادات |
| `bot_whitelist` | قائمة البوتات المسموحة |
| `tickets` | معلومات التذاكر |
| `shop_items` | عناصر المتجر |

---

## 🔐 نظام Anti-Raid

البوت يراقب الأحداث التالية ويتدخل تلقائياً:
- **حذف قنوات متعددة** في وقت قصير ← سحب الرتب + تنبيه
- **حذف رتب متعددة** ← نفس الإجراء
- **تغيير صلاحيات متكرر** ← تنبيه وتسجيل
- **دخول بوتات غير مُصرحة** ← طرد فوري

---

## 🏛️ التسلسل الهرمي للرتب

```
Owner → نائب المالك → المدير العام → مدير الإدارة
→ Senior Admin → Security Lead → Security
→ Mod Lead → Chat Moderator → Voice Moderator → Junior Moderator
→ Support Lead → Ticket Staff
→ Bot Manager → Developer → Logs Manager
→ Events Lead → Event Host
→ Designer → Content Creator → Partnership Manager → Greeter
→ VIP → Member → Visitor → Muted
```

---

## ❓ الأسئلة الشائعة

**س: البوت لا يرد على أوامر Slash**
ج: تأكد من تشغيل `node deploy-commands.js` وانتظر دقيقة.

**س: اللوقات لا تعمل**
ج: تأكد من إضافة IDs الرومات في ملف `.env`.

**س: كيف أضيف عناصر للمتجر؟**
ج: أضف مباشرة لقاعدة البيانات أو أنشئ أمر `/اضافة_متجر`.

**س: كيف أضيف بوتاً للـ Whitelist؟**
ج: اكتب في قاعدة البيانات:
```sql
INSERT INTO bot_whitelist (bot_id, guild_id, added_by) VALUES ('BOT_ID', 'GUILD_ID', 'YOUR_ID');
```

---

## 📞 الدعم

إذا واجهت أي مشكلة، تحقق من:
1. ملف `.env` مكتمل بجميع البيانات
2. البوت لديه صلاحية Administrator
3. تم تشغيل `npm install` بنجاح
4. Node.js v18 أو أحدث
