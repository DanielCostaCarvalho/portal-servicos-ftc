import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Categoria from 'App/Models/Categoria'
import Servico from 'App/Models/Servico'
import Usuario from 'App/Models/Usuario'
import {
  formatarErroCampoObrigatorio,
  getCampoErroValidacao, getErroValidacao,
  getMensagemErro,
  existeErroValidacao,
}
  from 'App/Utils/Utils'

export default class ServicosController {
  public async servicosCoordenador ({ request, response, params }: HttpContextContract) {
    try {
      const usuario: Usuario = request.input('usuario')

      const categoria = await Categoria.find(params.idCategoria)

      if(!categoria) {
        return response.status(401).json({
          'mensagem': 'Categoria não encontrada',
        })
      }

      if(categoria.id_coordenador !== usuario.id) {
        return response.status(401).json({
          'mensagem': 'Você não é o coordenador desta categoria',
        })
      }

      const servicos = await Servico.query().select(['id', 'nome'])
        .where('id_categoria', params.idCategoria)

      return servicos
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async cadastro ({ request, response }: HttpContextContract) {
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
                'id_coordenador': usuario.id,
              },
            }),
          ]),
        }),
        messages: {
          'id_categoria.exists': 'Categoria não encontrada',
        },
      })

      await Servico.create({...dadosCadastro})

      return response.status(201).json({ mensagem: 'Serviço criado com sucesso' })
    } catch (error) {
      if (getErroValidacao(error) === 'required') {
        const campoErro = getCampoErroValidacao(error)

        const erro = formatarErroCampoObrigatorio(campoErro)

        return response.status(401).json(erro)
      }

      if(existeErroValidacao(error)) {
        const erro = getMensagemErro(error)

        return response.status(401).json(erro)
      }

      return response.badRequest({ error })
    }
  }

  public async atualizacao ({ request, response, params }: HttpContextContract) {
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
                  'id_coordenador': usuario.id,
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

      if(!servico) {
        return response.status(401).json({
          'mensagem': 'Serviço não encontrado',
        })
      }

      if(data.nome !== null) {
        servico.nome = data.nome
      }

      if(data.id_categoria !== null) {
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

      if(existeErroValidacao(error)) {
        const erro = getMensagemErro(error)

        return response.status(401).json(erro)
      }

      return response.badRequest({ error })
    }
  }

  public async deletar ({ request, response, params }: HttpContextContract) {
    try {
      const usuario: Usuario = request.input('usuario')

      const servico = await Servico.find(params.id)

      if(!servico) {
        return response.status(401).json({
          'mensagem': 'Serviço não encontrado',
        })
      }

      const categoria = await Categoria.find(servico.id_categoria)

      if(categoria?.id_coordenador !== usuario.id) {
        return response.status(401).json({
          'mensagem': 'Esse serviço não está associado a uma categoria em que você é coordenador',
        })
      }

      await servico.delete()

      return response.status(201).json({ mensagem: 'Serviço deletado com sucesso' })
    } catch (error) {
      return response.badRequest({ error })
    }
  }
}
