import { Op } from 'sequelize';
import { AppErrorCode, DataResult, genPaginationInfo, paginate, Todo, User } from '../../shared';
import { CreateTodoInput, TodoDTO, UpdateTodoInput } from '../models';

export class TodosDataAccess {
  /**
   * Create todo
   */
  public static async create(data: CreateTodoInput): Promise<DataResult<TodoDTO>> {
    const result: DataResult<TodoDTO> = {};
    try {
      /* check if the todo is already exists before  */
      if (!!(await Todo.count({ where: { title: { [Op.eq]: data.title } } }))) {
        result.validationErrors = [
          {
            code: AppErrorCode.ValueExists,
            title: 'Field value is exist',
            detail: 'Todo title is exist',
          },
        ];
        return result;
      }
      /** the user that the new todo will belong to */
      const user = await User.findByPk(data.user_id);
      if (!user) {
        result.validationErrors = [
          {
            code: AppErrorCode.RelatedEntityNotFound,
            source: 'user_id',
            title: 'Related entity not found',
            detail: 'User not found',
          },
        ];
        return result;
      }
      const todo = await Todo.create(data, {
        fields: ['title', 'description', 'status', 'user_id'],
      });
      /** reload the todo to get the user that the product belongs to */

      result.data = (await this.findById(todo.id, user.id)).data;
    } catch (error) {
      result.error = error as Error;
    }
    return result;
  }

  /**
   * Search todo
   */
  public static async search(
    title: string,
    user_id: number,
    page: number,
    pageSize: number
  ): Promise<DataResult<TodoDTO[]>> {
    const result: DataResult<TodoDTO[]> = {};
    try {
      page = page || 1;
      const { offset, limit } = paginate(page, pageSize);
      const todos = await Todo.findAndCountAll({
        where: {
          title: {
            [Op.iLike]: `%${title}%`,
          },
          user_id: {
            [Op.eq]: user_id,
          },
        },
        include: [{ model: User, required: true, as: 'user', attributes: ['id', 'email'] }],
        offset,
        limit,
        raw: true,
        nest: true,
      });
      result.data = todos.rows as TodoDTO[];
      result.paginationInfo = genPaginationInfo(page, pageSize, todos.count, todos.rows.length);
    } catch (error) {
      result.error = error as Error;
    }
    return result;
  }
  /**
   * (await Todo.findByPk(id, {
        include: [{ model: User, required: false, attributes: ['id', 'email'], as: 'user', where: { id: user_id } }],

        attributes: ['id', 'title', 'description', 'status'],
        raw: true,
        nest: true,
      })) as TodoDTO;
   */

  /**
   * Find todo by id
   */
  public static async findById(id: number, user_id: number): Promise<DataResult<TodoDTO>> {
    const result: DataResult<TodoDTO> = {};
    try {
      // find the todo by id and the user who created the todo
      result.data = (await Todo.findOne({
        where: {
          [Op.and]: [{ id: { [Op.eq]: id } }, { user_id: { [Op.eq]: user_id } }],
        },
      })) as TodoDTO;
      result.isNotFound = !result.data;
    } catch (error) {
      result.error = error as Error;
    }
    return result;
  }
  /**
   * Update todo by id
   */
  public static async update(data: UpdateTodoInput): Promise<DataResult<boolean>> {
    const result: DataResult<boolean> = {};
    try {
      const todo = await Todo.findOne({
        where: {
          [Op.and]: [{ id: { [Op.eq]: data.id } }, { user_id: { [Op.eq]: data.user_id } }],
        },
      });
      if (!todo) {
        result.isNotFound = true;
        return result;
      }
      /** check if the todo is already exists before when the title is not undefined  */
      if (
        data.title &&
        !!(await Todo.count({
          where: {
            [Op.and]: [{ title: data.title }, { id: { [Op.ne]: todo.id } }],
          },
        }))
      ) {
        result.validationErrors = [
          {
            code: AppErrorCode.ValueExists,
            title: 'Field value is exist',
            detail: 'Todo title is exist',
          },
        ];
        return result;
      }
      // // check if the user_id property which is passed in the data is the user who created the todo.
      // if (data.user_id && data.user_id !== +todo.user_id) {
      //   result.validationErrors = [
      //     {
      //       code: AppErrorCode.RelatedEntityNotFound,
      //       source: 'user_id',
      //       title: 'Related entity not found',
      //       detail: 'User not found',
      //     },
      //   ];
      //   return result;
      // }

      await todo.update(data, {
        fields: ['title', 'description', 'status'],
      });
      result.data = true;
    } catch (error) {
      result.error = error as Error;
    }
    return result;
  }

  public static async delete(id: number, user_id: number): Promise<DataResult<boolean>> {
    const result: DataResult<boolean> = {};
    try {
      /**
       *  TODO: handle the forbidden case when the user is not the owner of the todo
       * Right now if the user try to delete a todo that is not one of his todos, the server will respond with 404
       */
      const todo = await Todo.findOne({
        where: {
          [Op.and]: [{ id: { [Op.eq]: id } }, { user_id: { [Op.eq]: user_id } }],
        },
        include: [{ model: User, required: true, as: 'user' }],
      });
      if (!todo) {
        result.isNotFound = true;
        return result;
      }
      await todo.destroy();
      result.data = true;
    } catch (error) {
      result.error = error as Error;
    }
    return result;
  }
}
