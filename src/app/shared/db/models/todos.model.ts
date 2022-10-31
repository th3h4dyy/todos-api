import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
} from 'sequelize';
import { Database } from '../helpers';
import { User } from './users.model';

export class Todo extends Model<InferAttributes<Todo>, InferCreationAttributes<Todo>> {
  declare id: CreationOptional<number>;
  declare user_id: ForeignKey<User['id']>;
  declare owner?: NonAttribute<User>;
  declare title: string;
  declare description: string | null;
  declare status: boolean | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Todo.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize: Database.sequelize,
    tableName: 'todos',
  }
);
