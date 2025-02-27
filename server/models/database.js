// server/models/database.js
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { Sequelize, DataTypes } from 'sequelize';

// اتصال به پایگاه داده
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false,
  });

// =========================
// 1) مدل User
// =========================
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  balance: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  wallet_address: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // مجموع درآمد از دعوت دیگران
  total_referral_earnings: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user', // نقش پیش‌فرض "کاربر عادی"
  },
});

// =========================
// 2) مدل Event
// =========================
const Event = sequelize.define('Event', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    option_1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    option_2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active',
    },
// چه کسی این رویداد را ساخته (می‌تواند null باشد اگر ادمین ساخته)
    creator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
// مجموع مبالغ شرط‌بندی (اختیاری)
    total_pool: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
// درصد کمیسیون سازنده
    commission_creator: {
      type: DataTypes.FLOAT,
      defaultValue: 0.02,
    },
// درصد کمیسیون رفرال
    commission_referral: {
      type: DataTypes.FLOAT,
      defaultValue: 0.05,
    },
});
  

// =========================
// 3) مدل Bet
// =========================
const Bet = sequelize.define('Bet', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bet_option: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bet_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
  },
});

// =========================
// 4) مدل Payment
// =========================
const Payment = sequelize.define('Payment', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'completed',
  },
});

// =========================
// 5) مدل WalletHistory
// =========================
const WalletHistory = sequelize.define('WalletHistory', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  wallet_address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
  },
});

// =========================
// 6) مدل PendingCommission
// =========================
const PendingCommission = sequelize.define('PendingCommission', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // دریافت‌کننده‌ی کمیسیون
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bet_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    commission_type: {
      type: DataTypes.STRING, // "creator" یا "referral" یا "self" (برای حالتی که به خودش برمی‌گردد)
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
});
  

// =========================
// 7) مدل Referral
// =========================
const EventReferral = sequelize.define('EventReferral', {
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  referrer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  referred_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, { timestamps: true }); // بررسی کن که timestamps: true باشد

// =========================
// 8) مدل tag
// =========================  
const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Tags', // باید نام جدول دیتابیس باشد
      key: 'id',
    },
    onDelete: 'CASCADE', // اگر تگ والد حذف شود، زیرمجموعه‌ها هم حذف شوند
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved'),
    defaultValue: 'pending',
  },
});

// =========================
// 9) مدل EventTag
// =========================
const EventTag = sequelize.define('EventTag', {
  event_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Events', key: 'id' } },
  tag_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Tags', key: 'id' } },
}, { timestamps: false });

// =========================
// 10) مدل UserPreference
// =========================
const UserPreference = sequelize.define('UserPreference', {
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
  tag_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Tags', key: 'id' } },
}, { timestamps: false });

// =========================
// تعریف ارتباطات
// =========================

// Associations

// 1) User <-> Bet
User.hasMany(Bet, { foreignKey: 'user_id' });
Bet.belongsTo(User, { foreignKey: 'user_id' });

// 2) Event <-> Bet
Event.hasMany(Bet, { foreignKey: 'event_id' });
Bet.belongsTo(Event, { foreignKey: 'event_id' });

// 3) User <-> Payment
User.hasMany(Payment, { foreignKey: 'user_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' });

// 4) User <-> WalletHistory
User.hasMany(WalletHistory, { foreignKey: 'user_id' });
WalletHistory.belongsTo(User, { foreignKey: 'user_id' });

// 5) PendingCommission <-> User
// user_id در PendingCommission یعنی کمیسیون متعلق به کدام کاربر است (گیرنده‌ی کمیسیون)
User.hasMany(PendingCommission, { foreignKey: 'user_id' });
PendingCommission.belongsTo(User, { foreignKey: 'user_id' });

// 6) PendingCommission <-> Event
// event_id در PendingCommission یعنی کمیسیون مربوط به کدام رویداد است
Event.hasMany(PendingCommission, { foreignKey: 'event_id' });
PendingCommission.belongsTo(Event, { foreignKey: 'event_id' });

// 7) PendingCommission <-> Bet
// چون ممکن است یک شرط (Bet) چند کمیسیون داشته باشد (creator/referral/...),
// از hasMany برای Bet -> PendingCommission استفاده می‌کنیم
Bet.hasMany(PendingCommission, { foreignKey: 'bet_id' });
PendingCommission.belongsTo(Bet, { foreignKey: 'bet_id' });

// 8) افزودن رابطه‌ی سازنده رویداد (creator)
// اگر در مدل Event، فیلد creator_id را تعریف کرده‌ایم:
Event.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });
User.hasMany(Event, { foreignKey: 'creator_id', as: 'createdEvents' });

// 9) Referral (یا EventReferral)
// اگر مدل Referral فیلد event_id دارد و رویدادمحور است:
Event.hasMany(EventReferral, { foreignKey: 'event_id', as: 'eventReferrals' });
EventReferral.belongsTo(Event, { foreignKey: 'event_id', as: 'referralEvent' });

// 10) رابطه‌ی User با Referral
// کاربری که دیگران را دعوت می‌کند (referrer)
User.hasMany(EventReferral, { foreignKey: 'referrer_id', as: 'referrals' });
EventReferral.belongsTo(User, { foreignKey: 'referrer_id', as: 'referrer' });
// کاربری که دعوت شده (referred)
User.hasOne(EventReferral, { foreignKey: 'referred_id', as: 'referralInfo' });
EventReferral.belongsTo(User, { foreignKey: 'referred_id', as: 'referred' });
// ارتباط Event و Tag از طریق EventTag
Event.belongsToMany(Tag, { through: EventTag, foreignKey: 'event_id' });
Tag.belongsToMany(Event, { through: EventTag, foreignKey: 'tag_id' });

// ارتباط User و Tag از طریق UserPreference
User.belongsToMany(Tag, { through: UserPreference, foreignKey: 'user_id' });
Tag.belongsToMany(User, { through: UserPreference, foreignKey: 'tag_id' });
Tag.belongsTo(Tag, { as: 'parent', foreignKey: 'parent_id' });
Tag.hasMany(Tag, { as: 'children', foreignKey: 'parent_id' });


// =========================
// خروجی ماژول
// =========================
export {
  sequelize,
  User,
  Event,
  Bet,
  Payment,
  WalletHistory,
  PendingCommission,
  EventReferral,
  Tag,
  EventTag,
  UserPreference
};
