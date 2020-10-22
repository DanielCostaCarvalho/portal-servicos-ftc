import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Unidades extends BaseSchema {
  protected tableName = 'unidades'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome', 80).notNullable()
      table.foreign('id_diretor').references('id').inTable('usuarios')
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
