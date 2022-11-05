import { Router, Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { BadRequest, Created, CustomValidationErrorFormatter, NoContent, NotFound, Ok, protect } from '../shared';
import { CreateTodoInput, createTodoValidator, TodosDataAccess, UpdateTodoInput, updateTodoValidator } from '../todos';

export const todosRouter = Router();

export const todosRelativeRoute = 'todos';

/**
 * Create todo router.
 */
todosRouter.post('', createTodoValidator, protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationErrors = validationResult(req)
      .formatWith(CustomValidationErrorFormatter)
      .array({ onlyFirstError: true });
    if (validationErrors.length) {
      return BadRequest(res, { errors: validationErrors });
    }
    const data: CreateTodoInput = { ...req.body, user_id: req.user.id };
    const result = await TodosDataAccess.create(data);
    if (result.error) {
      next(result.error);
    } else if (result.validationErrors?.length) {
      BadRequest(res, { errors: result.validationErrors });
    } else {
      Created(res, { data });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Search todo route
 */
todosRouter.get('', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TodosDataAccess.search(
      req.query.title as string,
      req.user.id,
      Number.parseInt(req.query.page as string) || 1,
      Number.parseInt(req.query.pageSize as string) || 5
    );
    if (result.error) {
      next(result.error);
    } else if (result.data) {
      Ok(res, { data: result.data, meta: { ...result.paginationInfo } });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Find todo by id
 */
todosRouter.get('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const todoId = parseInt(req.params.id);

    // check if the req.user is the owner of the todo

    // const result = await TodosDataAccess.findById(todoId);
    // find todo by id that belongs to the req.user
    const result = await TodosDataAccess.findById(todoId, req.user.id as number);

    if (result.error) {
      next(result.error);
    } else if (result.isNotFound) {
      NotFound(res);
    } else {
      Ok(res, { data: result.data });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Update todo by id
 */
todosRouter.put('/:id', updateTodoValidator, protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationErrors = validationResult(req)
      .formatWith(CustomValidationErrorFormatter)
      .array({ onlyFirstError: true });
    if (validationErrors.length) {
      return BadRequest(res, { errors: validationErrors });
    }
    const data: UpdateTodoInput = { ...req.body, id: Number.parseInt(req.params.id), user_id: req.user.id };
    const result = await TodosDataAccess.update(data);
    if (result.error) {
      next(result.error);
    } else if (result.isNotFound) {
      NotFound(res);
    } else if (result.validationErrors?.length) {
      BadRequest(res, { errors: result.validationErrors });
    } else {
      NoContent(res);
    }
  } catch (error) {
    next(error);
  }
});

todosRouter.delete('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const todoId = parseInt(req.params.id);
    const result = await TodosDataAccess.delete(todoId, req.user.id as number);
    if (result.error) {
      next(result.error);
    } else if (result.isNotFound) {
      NotFound(res);
    } else {
      NoContent(res);
    }
  } catch (error) {
    next(error);
  }
});
