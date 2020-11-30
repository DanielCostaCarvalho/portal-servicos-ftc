import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Desistencias extends BaseSchema {
  protected tableName = 'desistencias'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('id_servico').unsigned().references('id').inTable('servicos').notNullable()
      table.integer('id_cliente').unsigned().references('id').inTable('usuarios').notNullable()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
