import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Categorias extends BaseSchema {
  protected tableName = 'categorias'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome', 60).notNullable()
      table.integer('id_coordenador').unsigned().references('id').inTable('usuarios')
      table.integer('id_unidade').unsigned().references('id').inTable('unidades').notNullable()
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
