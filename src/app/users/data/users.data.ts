import { Op } from 'sequelize';
import { AccessTokenResponse, AppErrorCode, DataResult, signToken, User } from '../../shared';
import { CreateUserInput, UpdateUserInput, UserDTO } from '../models';
import { LoginUserInput } from '../models/login-user.model';

export class UsersDataAccess {
  /**
   * Create a user
   */
  public static async create(data: CreateUserInput): Promise<DataResult<UserDTO>> {
    const result: DataResult<UserDTO> = {};
    /* check if the email is already in the database */
    try {
      if (!!(await User.count({ where: { email: data.email } }))) {
        result.validationErrors = [
          {
            code: AppErrorCode.ValueExists,
            source: 'email',
            title: 'Field value already exists',
            detail: 'User email already exists',
          },
        ];
        return result;
      }
      const user = await User.create(data, {
        fields: ['firstName', 'lastName', 'email', 'password'],
      });
      result.data = { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } as UserDTO;
    } catch (error) {
      result.error = error as Error;
    }
    return result;
  }

  public static async login(data: LoginUserInput): Promise<DataResult<AccessTokenResponse>> {
    const result: DataResult<AccessTokenResponse> = {};
    try {
      /* check if the user email exists and has correct password */
      const user = await User.findOne({ where: { email: { [Op.eq]: data.email } } });
      if (!user || !(await user.correctPassword(data.password, user.password))) {
        result.validationErrors = [
          {
            code: AppErrorCode.UnAuthenticated,
            title: 'Invalid field data',
            detail: 'Invalid email or password',
          },
        ];
        return result;
      }
      // sign user id and return token
      const token = await signToken({ id: user.id }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      const refreshToken = (await signToken(
        { id: user.id },
        process.env.JWT_REFRESH_TOKEN_SECRET as string,
        {}
      )) as string;
      // update refresh token in the database
      await user.update({ refreshToken });
      result.data = { access_token: token, refresh_token: refreshToken } as AccessTokenResponse;
    } catch (error) {
      result.error = error as Error;
    }
    return result;
  }

  /**
   * Logout a user
   */
  public static async logout(token: string): Promise<DataResult<boolean>> {
    const result: DataResult<boolean> = {};
    try {
      await User.update({ refreshToken: null }, { where: { refreshToken: token } });
      result.data = true;
    } catch (error) {
      result.error = error as Error;
    }
    return result;
  }

  /**
   * Update a user
   */
  public static async update(data: UpdateUserInput): Promise<DataResult<boolean>> {
    const result: DataResult<boolean> = {};
    try {
      const user = await User.findByPk(data.id);
      if (!user) {
        result.isNotFound = true;
        return result;
      }
      /** Check if email is already exists for another user in database */
      const emailExists = !!(await User.count({
        where: {
          [Op.and]: [{ email: { [Op.eq]: data.email } }, { id: { [Op.ne]: data.id } }],
        },
      }));

      if (emailExists) {
        result.validationErrors = [
          {
            code: AppErrorCode.ValueExists,
            source: 'email',
            title: 'Field value already exists',
            detail: 'User email already exists',
          },
        ];
        return result;
      }
      await user.update(data);
      result.data = true;
    } catch (error) {
      result.error = error as Error;
    }
    return result;
  }
  /**
   * Delete a user
   */
  public static async delete(id: number): Promise<DataResult<boolean>> {
    const result: DataResult<boolean> = {};
    try {
      const user = await User.findByPk(id);
      if (!user) {
        result.isNotFound = true;
        return result;
      }
      await user.destroy();
      result.data = true;
    } catch (error) {
      result.error = error as Error;
    }
    return result;
  }
}
