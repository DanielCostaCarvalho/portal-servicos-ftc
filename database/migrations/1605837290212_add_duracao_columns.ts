import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddDuracaoColumns extends BaseSchema {
  protected tableName = 'agendas'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table.integer('duracao')
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('duracao')
    })
  }
}
