import { AppErrorCode, DataResult, User } from '../../shared';
import { CreateUserInput, UserDTO } from '../models';

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
      const user = await User.create(
        { email: data.email, password: data.password, firstName: data.firstName, lastName: data.lastName },
        {
          fields: ['firstName', 'lastName', 'email', 'password'],
        }
      );
      result.data = user as UserDTO;
    } catch (error) {
      result.error = error as Error;
    }
    return result;
  }
}
