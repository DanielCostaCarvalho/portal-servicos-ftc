import Env from '@ioc:Adonis/Core/Env'
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddDuracaoColumns extends BaseSchema {
  protected tableName = 'usuarios'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      Env.get('DB_CONNECTION') !== 'sqlite' && table.string('senha', 100).notNullable().alter()
    })
  }
}
