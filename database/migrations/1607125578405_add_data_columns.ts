import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddDuracaoColumns extends BaseSchema {
  protected tableName = 'desistencias'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table.dateTime('data_hora')
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dateTime('data_hora')
    })
  }
}
