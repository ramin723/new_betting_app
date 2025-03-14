import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../plugins/sequelize'

export class User extends Model {
  declare id: number
  declare username: string
  declare password: string
  declare first_name?: string
  declare last_name?: string
  declare email?: string
  declare role: 'admin' | 'user'
  declare balance: number
  declare avatar?: string
  declare commission?: number
  declare points?: number
}

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
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING
    },
    last_name: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user'
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    avatar: {
      type: DataTypes.STRING
    },
    commission: {
      type: DataTypes.DECIMAL(5, 2)
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    modelName: 'User',
    timestamps: true
  }
) 