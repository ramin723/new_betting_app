import { Model, DataTypes, Sequelize } from 'sequelize'
import { sequelize } from '../plugins/sequelize'
import type { UserAttributes, UserModel, UserRole } from './types/UserInterface'
import { USER_ROLES, SECURITY } from '../constants'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

/**
 * مدل User
 * مسئول نگهداری اطلاعات کاربران سیستم
 */
export class User extends Model<UserAttributes, UserModel> implements UserModel {
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
  public role!: UserRole
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  /**
   * مقایسه رمز عبور با هش ذخیره شده
   */
  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }

  /**
   * تولید توکن احراز هویت
   */
  public generateToken(): string {
    return jwt.sign(
      { 
        id: this.id,
        username: this.username,
        role: this.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: SECURITY.TOKEN_EXPIRY }
    )
  }
}

// تعریف مدل
export const initUser = (sequelize: Sequelize): void => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 30],
        },
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
          isEmail: true,
        },
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [2, 50],
        },
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [2, 50],
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [8, 100],
        },
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      wallet_address: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      isBlocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      total_referral_earnings: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      role: {
        type: DataTypes.ENUM(...Object.values(USER_ROLES)),
        allowNull: false,
        defaultValue: USER_ROLES.USER,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'users',
      indexes: [
        {
          unique: true,
          fields: ['username'],
        },
        {
          unique: true,
          fields: ['email'],
        },
        {
          unique: true,
          fields: ['telegram_id'],
        },
        {
          unique: true,
          fields: ['wallet_address'],
        },
      ],
      hooks: {
        beforeCreate: async (user: User): Promise<void> => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(user.password, salt)
          }
        },
        beforeUpdate: async (user: User): Promise<void> => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(user.password, salt)
          }
        },
      },
    }
  )
}

export default User 