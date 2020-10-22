import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Agenda extends BaseSchema {
  protected tableName = 'agendas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.dateTime('data_hora').notNullable()
      table.foreign('id_servico').references('id').inTable('servicos').notNullable()
      table.foreign('id_cliente').references('id').inTable('usuarios')
      table.string('atendente', 60)
      table.foreign('id_professor_responsavel').references('id').inTable('usuarios')
      table.foreign('id_responsavel_cancelamento').references('id').inTable('usuarios')
      table.string('justificativa_cancelamento', 100)
      table.string('observacao', 100)
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
