import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Usuarios extends BaseSchema {
  protected tableName = 'usuarios'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome', 80).notNullable()
      table.string('email', 100).unique().notNullable()
      table.string('senha', 30).notNullable()
      table.enum('tipo', ['Cliente', 'Diretor', 'Coordenador', 'Master', 'Professor']).notNullable()
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
