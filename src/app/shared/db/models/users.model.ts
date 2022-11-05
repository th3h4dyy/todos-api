import crypto from 'crypto';
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
import bcrypt from 'bcrypt';
import { Database } from '../helpers';
import { Todo } from './todos.model';
import { JWTRESULT } from '../../models/jwt-result.model';
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
  declare refreshToken: string | null;
  declare passwordResetToken: string | null;
  declare passwordResetExpires: Date | null;
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
  /**
   *
   * @param candidatePassword the incoming password from the user who tries to login.
   * @param userPassword  the actual password which is stored in the database.
   * @returns `true` if the password is correct, otherwise, `false`.
   */
  async correctPassword(candidatePassword: string, userPassword: string) {
    return await bcrypt.compare(candidatePassword, userPassword);
  }

  // check if user changed password after the token was issued
  async changedPasswordAfter(decoded: JWTRESULT) {
    if (this.changed('password')) {
      const changedTimestamp = parseInt((this.updatedAt.getTime() / 1000).toString(), 10);
      return decoded.iat < changedTimestamp;
    }
    return false;
  }

  createPasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // working for 10 minutes
    console.log({ resetToken }, this.passwordResetToken);
    return resetToken;
  }
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
    refreshToken: {
      type: DataTypes.STRING,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
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

User.beforeCreate(async (user, options) => {
  if (user.changed('password')) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
  }
});

User.beforeUpdate(async (user, options) => {
  if (user.changed('password')) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
  }
});
