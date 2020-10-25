import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Servicos extends BaseSchema {
  protected tableName = 'servicos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome', 60).notNullable()
      table.integer('id_categoria').unsigned().references('id').inTable('categorias').notNullable()
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
