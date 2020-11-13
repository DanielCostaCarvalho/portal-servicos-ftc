import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Agenda extends BaseSchema {
  protected tableName = 'agendas'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.dateTime('data_hora').notNullable()
      table.integer('id_servico').unsigned().references('id').inTable('servicos').notNullable()
      table.integer('id_cliente').unsigned().references('id').inTable('usuarios')
      table.string('atendente', 60)
      table.integer('id_professor_responsavel').unsigned().references('id').inTable('usuarios')
      table.integer('id_responsavel_cancelamento').unsigned().references('id').inTable('usuarios')
      table.string('justificativa_cancelamento', 100)
      table.string('observacao', 100)
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
