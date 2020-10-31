import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Postagens extends BaseSchema {
  protected tableName = 'postagens'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('titulo', 80).notNullable()
      table.text('mensagem').notNullable()
      table.boolean('ativa').defaultTo(true)
      table.dateTime('data_expiracao')
      table.integer('id_categoria').unsigned().references('id').inTable('categorias')
      table.integer('id_unidade').unsigned().references('id').inTable('unidades').notNullable()
      table.integer('id_usuario').unsigned().references('id').inTable('usuarios')
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
