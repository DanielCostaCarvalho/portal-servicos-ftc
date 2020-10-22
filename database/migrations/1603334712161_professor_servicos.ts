import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ProfessorServicos extends BaseSchema {
  protected tableName = 'professor_servicos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.foreign('id_servico').references('id').inTable('servicos').notNullable()
      table.foreign('id_professor').references('id').inTable('usuarios').notNullable()
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
