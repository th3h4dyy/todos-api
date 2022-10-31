import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
  Association,
  HasManyGetAssociationsMixin,
} from 'sequelize';
import { Database } from '../helpers';
import { Todo } from './todos.model';
// We used `omit` here to exclude the `todos` since it's an association not an attribute
export class User extends Model<
  InferAttributes<User, { omit: 'todos' }>,
  InferCreationAttributes<User, { omit: 'todos' }>
> {
  // id can be undefined when using autoIncrement.
  declare id: CreationOptional<number>;
  declare firstName: string | null;
  declare lastName: string | null;
  declare email: string;
  declare password: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  // Since TS cannot determine model association at compile time
  // we have to declare them here purely virtually
  // these will not exist until `Model.init` was called.
  declare todos?: NonAttribute<Todo[]>; // Note this is optional since it's only populated when explicitly requested in code
  declare getTodos: HasManyGetAssociationsMixin<Todo>;
  public declare static associations: {
    todos: Association<User, Todo>;
  };
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING(128),
    },
    lastName: {
      type: DataTypes.STRING(128),
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
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
    tableName: 'users',
  }
);
