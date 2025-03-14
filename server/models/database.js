// server/models/database.js
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize, DataTypes } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database.sqlite');
console.log('📁 Database path:', dbPath);

// اتصال به پایگاه داده
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: true, // فعال کردن لاگ‌ها برای دیباگ
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
  telegram_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
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
    event_type: {
      type: DataTypes.ENUM('yes_no', 'winner', 'custom'),
      allowNull: false,
      defaultValue: 'yes_no',
    },
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    result_time: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'زمان مشخص شدن نتیجه رویداد',
    },
    betting_deadline: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'مهلت شرط‌بندی',
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'زمان شروع نمایش رویداد در سایت',
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'زمان پایان نمایش رویداد در سایت',
    },
    reference_event: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'رویداد مرجع (مثلاً نام مسابقه یا جشنواره)',
    },
    reference_link: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'لینک مرجع برای اعتبارسنجی',
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'active', 'closed', 'cancelled'),
      defaultValue: 'draft',
    },
    creator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    admin_note: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'یادداشت ادمین برای رد یا تایید رویداد',
    },
    total_pool: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    commission_creator: {
      type: DataTypes.FLOAT,
      defaultValue: 0.02,
    },
    commission_referral: {
      type: DataTypes.FLOAT,
      defaultValue: 0.05,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'آیا رویداد ویژه است',
    },
    template_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'اگر از یک قالب استفاده شده باشد',
    }
});
  

// =========================
// 3) مدل Bet
// =========================
const Bet = sequelize.define('Bet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  option_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bet_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'won', 'lost', 'cancelled'),
    defaultValue: 'active',
  },
  potential_win_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }
}, {
  tableName: 'bets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['event_id']
    },
    {
      fields: ['option_id']
    },
    {
      fields: ['status']
    }
  ]
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
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'deposit',      // واریز
      'withdraw',     // برداشت
      'bet',         // شرط‌بندی
      'win',         // برد
      'commission',  // کمیسیون
      'refund'      // بازگشت پول
    ),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'pending',    // در انتظار
      'completed',  // تکمیل شده
      'failed',     // ناموفق
      'cancelled'   // لغو شده
    ),
    defaultValue: 'pending'
  },
  amount: {
    type: DataTypes.DECIMAL(24, 9),
    allowNull: false
  },
  old_balance: {
    type: DataTypes.DECIMAL(24, 9),
    allowNull: false
  },
  new_balance: {
    type: DataTypes.DECIMAL(24, 9),
    allowNull: false
  },
  wallet_address: {
    type: DataTypes.STRING(48),
    allowNull: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'events',
      key: 'id'
    }
  },
  bet_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'bets',
      key: 'id'
    }
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'wallet_histories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['event_id']
    },
    {
      fields: ['bet_id']
    },
    {
      fields: ['created_at']
    }
  ]
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
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved'),
    defaultValue: 'pending',
  }
}, {
  tableName: 'Tags'
});

// تعریف رابطه self-referential برای تگ‌ها
Tag.belongsTo(Tag, { as: 'parent', foreignKey: 'parent_id' });
Tag.hasMany(Tag, { as: 'children', foreignKey: 'parent_id' });

// =========================
// 9) مدل Option
// =========================
const Option = sequelize.define('Option', {
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  odds: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1,
  },
  total_bets: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_amount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  is_winner: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
});

// =========================
// روابط بین مدل‌ها
// =========================
Event.hasMany(Option, { as: 'Options', foreignKey: 'event_id' });
Option.belongsTo(Event, { foreignKey: 'event_id' });

Option.hasMany(Bet, { foreignKey: 'option_id' });
Bet.belongsTo(Option, { foreignKey: 'option_id' });

// =========================
// 10) مدل EventTag
// =========================
const EventTag = sequelize.define('EventTag', {
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tag_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

// =========================
// 11) مدل UserPreference
// =========================
const UserPreference = sequelize.define('UserPreference', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tag_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  preferred_tags: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  notification_settings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      email: true,
      push: true
    }
  }
});

// =========================
// مدل Transaction
// =========================
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  wallet_history_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'WalletHistory',
      key: 'id'
    }
  },
  tx_hash: {
    type: DataTypes.STRING(66),
    allowNull: false,
    unique: true
  },
  block_number: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  confirmation_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ton_amount: {
    type: DataTypes.DECIMAL(24, 9),
    allowNull: false
  },
  usd_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  sender_address: {
    type: DataTypes.STRING(48),
    allowNull: false
  },
  receiver_address: {
    type: DataTypes.STRING(48),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'failed'),
    defaultValue: 'pending'
  },
  raw_data: {
    type: DataTypes.JSON,
    allowNull: true
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['tx_hash']
    },
    {
      fields: ['wallet_history_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['block_number']
    }
  ]
});

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
// این رابطه را نگه می‌داریم چون اول تعریف شده
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

// =========================
// 11) مدل EventTemplate
// =========================
const EventTemplate = sequelize.define('EventTemplate', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'نام قالب',
  },
  type: {
    type: DataTypes.ENUM('yes_no', 'winner', 'custom'),
    allowNull: false,
  },
  question_template: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'قالب سوال با متغیرها مثل {date} یا {team}',
  },
  default_deadline_hours: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 24,
    comment: 'فاصله پیش‌فرض مهلت شرط‌بندی از زمان نتیجه (ساعت)',
  },
  required_fields: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'فیلدهای مورد نیاز برای تکمیل قالب',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
});

// رابطه بین Event و EventTemplate
Event.belongsTo(EventTemplate, { foreignKey: 'template_id', as: 'template' });
EventTemplate.hasMany(Event, { foreignKey: 'template_id', as: 'events' });

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
  UserPreference,
  Option,
  EventTemplate,
  Transaction
};
