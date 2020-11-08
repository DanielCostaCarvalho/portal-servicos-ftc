import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Unidade from 'App/Models/Unidade'
import Usuario from 'App/Models/Usuario'
import {
  getErroValidacao,
  getCampoErroValidacao,
  formatarErroCampoObrigatorio,
} from 'App/Utils/Utils'

export default class UnidadesController {
  public async cadastro({ request, response }: HttpContextContract) {
    try {
      const dadosCadastro = await request.validate({
        schema: schema.create({
          nome: schema.string(),
          id_diretor: schema.number(),
        }),
      })

      const diretor = await Usuario.find(request.input('id_diretor'))

      if (diretor?.tipo !== 'Diretor') {
        return response.status(401).json({
          mensagem: 'Usuário escolhido para diretor da unidade não tem essa função cadastrada',
        })
      }

      await Unidade.create({ ...dadosCadastro })

      return response.status(201).json({ mensagem: 'Unidade criada com sucesso' })
    } catch (error) {
      if (getErroValidacao(error) === 'required') {
        const campoErro = getCampoErroValidacao(error)

        const erro = formatarErroCampoObrigatorio(campoErro)

        return response.status(401).json(erro)
      }

      return response.badRequest({ error })
    }
  }

  public async getUnidadesMaster({ response }: HttpContextContract) {
    try {
      return await Unidade.query()
        .select(['id', 'nome', 'id_diretor'])
        .preload('diretor', (query) => {
          query.select(['id', 'nome'])
        })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async getUnidades({ response }: HttpContextContract) {
    try {
      return await Unidade.query()
        .select(['id', 'nome'])
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async getUnidadeId({ response, params }: HttpContextContract) {
    try {
      const unidade = await Unidade.query()
        .where('id', params.id)
        .select(['id', 'nome', 'id_diretor'])
        .preload('diretor', (query) => {
          query.select(['id', 'nome'])
        })
        .first()

      if (!unidade) {
        return response.status(401).json({
          mensagem: 'Unidade não encontrada',
        })
      }

      return unidade
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async atualizacao({ request, response, params }: HttpContextContract) {
    try {
      const data = request.only(['nome', 'id_diretor'])

      const unidade = await Unidade.find(params.id)

      if (!unidade) {
        return response.status(401).json({
          mensagem: 'Unidade não encontrada',
        })
      }

      if (data.nome) {
        unidade.nome = data.nome
      }

      if (data.id_diretor) {
        const diretor = await Usuario.find(data.id_diretor)

        if (diretor?.tipo !== 'Diretor') {
          return response.status(401).json({
            mensagem: 'Usuário escolhido para diretor da unidade não tem essa função cadastrada',
          })
        }

        unidade.id_diretor = data.id_diretor
      }

      unidade.save()

      return response.status(201).json({ mensagem: 'Unidade atualizada com sucesso' })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async deletar({ response, params }: HttpContextContract) {
    try {
      const unidade = await Unidade.find(params.id)

      if (!unidade) {
        return response.status(401).json({
          mensagem: 'Unidade não encontrada',
        })
      }

      await unidade.delete()

      return response.status(201).json({ mensagem: 'Unidade deletada com sucesso' })
    } catch (error) {
      return response.badRequest({ error })
    }
  }
}
