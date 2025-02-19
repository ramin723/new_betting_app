import { Sequelize, DataTypes } from 'sequelize';

// اتصال به پایگاه داده
const sequelize = new Sequelize({
    dialect: 'sqlite', // استفاده از SQLite
    storage: './database.sqlite', // محل ذخیره دیتابیس
});

// مدل User
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
});

// مدل Event
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
});

// مدل Bet
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

// مدل Payment
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

// مدل WalletHistory
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

// تعریف ارتباطات
User.hasMany(Bet, { foreignKey: 'user_id' });
Bet.belongsTo(User, { foreignKey: 'user_id' });

Event.hasMany(Bet, { foreignKey: 'event_id' });
Bet.belongsTo(Event, { foreignKey: 'event_id' });

User.hasMany(Payment, { foreignKey: 'user_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(WalletHistory, { foreignKey: 'user_id' });
WalletHistory.belongsTo(User, { foreignKey: 'user_id' });

export { sequelize, User, Event, Bet, Payment, WalletHistory };
