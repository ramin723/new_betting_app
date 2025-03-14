import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../config/database'

class User extends Model {
  public id!: number
  public username!: string
  public telegram_id?: string
  public email?: string
  public first_name?: string
  public last_name?: string
  public password!: string
  public balance!: number
  public wallet_address?: string
  public isBlocked!: boolean
  public total_referral_earnings!: number
  public role!: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  telegram_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
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
    allowNull: true
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  balance: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  wallet_address: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  total_referral_earnings: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user'
  }
}, {
  sequelize,
  modelName: 'User',
  timestamps: true
})

export default User 