import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('todos_db', 'ahmed', 'testpass123', {
  dialect: 'postgres',
  host: 'localhost',
});

export class Database {
  public static readonly sequelize: Sequelize = sequelize;

  public static testDatabaseConnection(): Promise<void> {
    return sequelize.authenticate();
  }

  public static syncDatabase(force?: boolean) {
    return sequelize.sync({ force });
  }
}
