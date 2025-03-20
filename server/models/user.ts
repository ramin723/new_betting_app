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
  public first_name?: string
  public last_name?: string
  public email?: string
  public password!: string
  public role!: UserRole
  public balance!: number
  public avatar?: string
  public commission?: number
  public points?: number
  public wallet_address?: string
  public telegram_id?: string
  public referral_user?: number
  public total_referral_earnings!: number
  public isBlocked!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  /**
   * مقایسه رمز عبور
   * @param password رمز عبور برای مقایسه
   * @returns آیا رمز عبور صحیح است
   */
  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }

  /**
   * تولید توکن برای کاربر
   * @returns توکن تولید شده
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
      first_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [SECURITY.MIN_PASSWORD_LENGTH, 100],
        },
      },
      role: {
        type: DataTypes.ENUM(...Object.values(USER_ROLES)),
        allowNull: false,
        defaultValue: USER_ROLES.USER,
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      commission: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: 0,
          max: 100,
        },
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      wallet_address: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isAlphanumeric: true,
        },
      },
      telegram_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      referral_user: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      total_referral_earnings: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      isBlocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
          fields: ['role'],
        },
        {
          fields: ['referral_user'],
        },
      ],
      hooks: {
        beforeCreate: async (user: User): Promise<void> => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10)
          }
        },
        beforeUpdate: async (user: User): Promise<void> => {
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10)
          }
        },
      },
    }
  )
}

export default User 