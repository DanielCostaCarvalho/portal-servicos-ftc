import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Agendas extends BaseSchema {
  protected tableName = 'agendas'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table.boolean('atendido').defaultTo(false)
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('atendido')
    })
  }
}
