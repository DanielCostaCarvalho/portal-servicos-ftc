import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Postagens extends BaseSchema {
  protected tableName = 'postagens'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome', 80).notNullable()
      table.text('mensagem').notNullable()
      table.boolean('ativa').defaultTo(true)
      table.dateTime('data_expiracao')
      table.foreign('id_categoria').references('id').inTable('categorias')
      table.foreign('id_unidade').references('id').inTable('unidades').notNullable()
      table.foreign('id_usuario').references('id').inTable('usuarios')
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
