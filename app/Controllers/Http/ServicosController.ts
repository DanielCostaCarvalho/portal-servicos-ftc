import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Categoria from 'App/Models/Categoria'
import ProfessorServico from 'App/Models/ProfessorServico'
import Servico from 'App/Models/Servico'
import Usuario from 'App/Models/Usuario'
import {
  formatarErroCampoObrigatorio,
  getCampoErroValidacao,
  getErroValidacao,
  getMensagemErro,
  existeErroValidacao,
} from 'App/Utils/Utils'

export default class ServicosController {
  public async servicosCoordenador({ request, response, params }: HttpContextContract) {
    try {
      const usuario: Usuario = request.input('usuario')

      const categoria = await Categoria.find(params.idCategoria)

      if (!categoria) {
        return response.status(401).json({
          mensagem: 'Categoria não encontrada',
        })
      }

      if (categoria.id_coordenador !== usuario.id) {
        return response.status(401).json({
          mensagem: 'Você não é o coordenador desta categoria',
        })
      }

      const servicos = await Servico.query()
        .select(['servicos.id', 'servicos.nome'])
        .where('id_categoria', params.idCategoria)
        .preload('professores', (query) => {
          query.select(['id', 'nome'])
        })

      return servicos
    } catch (error) {
      console.log(error)
      return response.badRequest({ error })
    }
  }

  public async cadastro({ request, response }: HttpContextContract) {
    try {
      const usuario: Usuario = request.input('usuario')

      const dadosCadastro = await request.validate({
        schema: schema.create({
          nome: schema.string(),
          id_categoria: schema.number([
            rules.exists({
              table: 'categorias',
              column: 'id',
              where: {
                id_coordenador: usuario.id,
              },
            }),
          ]),
          ids_professores: schema.array().members(
            schema.number([
              rules.exists({
                table: 'usuarios',
                column: 'id',
                where: {
                  tipo: 'Professor',
                },
              }),
            ])
          ),
        }),
        messages: {
          'id_categoria.exists': 'Categoria não encontrada',
          'ids_professores.array': 'Não foi informado um array em ids_professores',
          '*': (field, rule) => {
            const [campo] = field.split('.')

            if (campo === 'ids_professores' && rule === 'number') {
              return 'O array de ids_professores precisa pode conter apenas números'
            }

            if (campo === 'ids_professores' && rule === 'exists') {
              return 'Um dos professores informados não foi encontrado'
            }

            return ''
          },
        },
      })

      const servico = await Servico.create({
        nome: dadosCadastro.nome,
        id_categoria: dadosCadastro.id_categoria,
      })

      await Promise.all(
        dadosCadastro.ids_professores.map(async (idProfessor) => {
          await ProfessorServico.create({
            id_professor: idProfessor,
            id_servico: servico.id,
          })
        })
      )

      return response.status(201).json({ mensagem: 'Serviço criado com sucesso' })
    } catch (error) {
      if (getErroValidacao(error) === 'required') {
        const campoErro = getCampoErroValidacao(error)

        const erro = formatarErroCampoObrigatorio(campoErro)

        return response.status(401).json(erro)
      }

      if (existeErroValidacao(error)) {
        const erro = getMensagemErro(error)

        return response.status(401).json(erro)
      }

      return response.badRequest({ error })
    }
  }

  public async atualizacao({ request, response, params }: HttpContextContract) {
    try {
      const usuario: Usuario = request.input('usuario')

      const data = request.only(['nome', 'id_categoria'])

      await request.validate({
        schema: schema.create({
          ...(data.nome !== undefined && {
            nome: schema.string(),
          }),
          ...(data.id_categoria !== undefined && {
            id_categoria: schema.number([
              rules.exists({
                table: 'categorias',
                column: 'id',
                where: {
                  id_coordenador: usuario.id,
                },
              }),
            ]),
          }),
        }),
        messages: {
          'id_categoria.exists': 'Categoria não encontrada',
        },
      })

      const servico = await Servico.find(params.id)

      if (!servico) {
        return response.status(401).json({
          mensagem: 'Serviço não encontrado',
        })
      }

      if (data.nome !== null) {
        servico.nome = data.nome
      }

      if (data.id_categoria !== null) {
        servico.id_categoria = data.id_categoria
      }

      await servico.save()

      return response.status(201).json({ mensagem: 'Serviço atualizado com sucesso' })
    } catch (error) {
      if (getErroValidacao(error) === 'required') {
        const campoErro = getCampoErroValidacao(error)

        const erro = formatarErroCampoObrigatorio(campoErro)

        return response.status(401).json(erro)
      }

      if (existeErroValidacao(error)) {
        const erro = getMensagemErro(error)

        return response.status(401).json(erro)
      }

      return response.badRequest({ error })
    }
  }

  public async deletar({ request, response, params }: HttpContextContract) {
    try {
      const usuario: Usuario = request.input('usuario')

      const servico = await Servico.find(params.id)

      if (!servico) {
        return response.status(401).json({
          mensagem: 'Serviço não encontrado',
        })
      }

      const categoria = await Categoria.find(servico.id_categoria)

      if (categoria?.id_coordenador !== usuario.id) {
        return response.status(401).json({
          mensagem: 'Esse serviço não está associado a uma categoria em que você é coordenador',
        })
      }

      await servico.delete()

      return response.status(201).json({ mensagem: 'Serviço deletado com sucesso' })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async vincularProfessorServico({ response, params }: HttpContextContract) {
    try {
      const usuario = await Usuario.find(params.idProfessor)

      if (!usuario) {
        return response.status(401).json({
          mensagem: 'Professor não encontrado',
        })
      }

      if (usuario.tipo !== 'Professor') {
        return response.status(401).json({
          mensagem: 'Usuário informado não é um professor',
        })
      }

      const servico = await Servico.find(params.idServico)

      if (!servico) {
        return response.status(401).json({
          mensagem: 'Serviço não encontrado',
        })
      }

      const professorServico = await ProfessorServico.query()
        .where('id_servico', servico.id)
        .where('id_professor', usuario.id)
        .first()

      if (professorServico) {
        return response.status(401).json({
          mensagem: 'Professor já estava vinculado ao serviço',
        })
      }

      await ProfessorServico.create({
        id_professor: usuario.id,
        id_servico: servico.id,
      })

      return response.status(201).json({ mensagem: 'Professor vinculado ao serviço com sucesso' })
    } catch (error) {
      if (getErroValidacao(error) === 'required') {
        const campoErro = getCampoErroValidacao(error)

        const erro = formatarErroCampoObrigatorio(campoErro)

        return response.status(401).json(erro)
      }

      if (existeErroValidacao(error)) {
        const erro = getMensagemErro(error)

        return response.status(401).json(erro)
      }

      return response.badRequest({ error })
    }
  }

  public async desvincularProfessorServico({ response, params }: HttpContextContract) {
    try {
      const usuario = await Usuario.find(params.idProfessor)

      if (!usuario) {
        return response.status(401).json({
          mensagem: 'Professor não encontrado',
        })
      }

      const servico = await Servico.find(params.idServico)

      if (!servico) {
        return response.status(401).json({
          mensagem: 'Serviço não encontrado',
        })
      }

      const professorServico = await ProfessorServico.query()
        .where('id_servico', servico.id)
        .where('id_professor', usuario.id)
        .first()

      if (!professorServico) {
        return response.status(401).json({
          mensagem: 'O Professor não está vinculado ao serviço',
        })
      }

      await professorServico.delete()

      return response
        .status(201)
        .json({ mensagem: 'Professor desvinculado do serviço com sucesso' })
    } catch (error) {
      if (getErroValidacao(error) === 'required') {
        const campoErro = getCampoErroValidacao(error)

        const erro = formatarErroCampoObrigatorio(campoErro)

        return response.status(401).json(erro)
      }

      if (existeErroValidacao(error)) {
        const erro = getMensagemErro(error)

        return response.status(401).json(erro)
      }

      return response.badRequest({ error })
    }
  }

  public async getServicoCoordenadorId({ request, response, params }: HttpContextContract) {
    try {
      const usuario: Usuario = request.input('usuario')

      const servico = await Servico.query()
        .where('id', params.id)
        .select(['id', 'nome', 'id_categoria'])
        .preload('professores', (query) => {
          query.select(['id', 'nome'])
        })
        .first()

      if (!servico) {
        return response.status(401).json({
          mensagem: 'Serviço não encontrado',
        })
      }

      const categoria = await Categoria.find(servico?.id_categoria)

      if (!categoria) {
        return response.status(401).json({
          mensagem: 'Nenhuma categoria encontrada neste serviço',
        })
      }

      if (categoria?.id_coordenador !== usuario.id) {
        return response.status(401).json({
          mensagem: 'Você não é o coodenador da categoria deste serviço',
        })
      }

      return servico
    } catch (error) {
      return response.badRequest({ error })
    }
  }
}
