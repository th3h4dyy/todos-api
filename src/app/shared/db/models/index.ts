export * from './todos.model';
export * from './users.model';

// Setup all models relations.
import { Todo } from './todos.model';
import { User } from './users.model';

User.hasMany(Todo, {
  foreignKey: 'user_id',
});
Todo.belongsTo(User, {
  foreignKey: 'user_id',
});
