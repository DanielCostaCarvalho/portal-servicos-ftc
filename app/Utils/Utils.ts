import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Usuario from 'App/Models/Usuario'

const SECRET = Env.get('JWT_SECRET', '@') as string

export const gerarTokenJWT = (usuario: Usuario) => {
  const secret = SECRET
  const expiresIn = 24 * 60 * 60
  const payload = {
    usuario: usuario.id,
    nome: usuario.nome,
    tipo: usuario.tipo,
  }

  const token = jwt.sign(payload, secret, { expiresIn })

  return token
}

export const verificarUsuarioMaster = (usuario: Usuario, { response }: HttpContextContract) => {
  if (usuario.tipo === 'Master') {
    return true
  }

  return response.unauthorized()
}

export const getErroValidacao = (error) => {
  return error.messages && error.messages.errors && error.messages.errors[0].rule
}

export const getCampoErroValidacao = (error) => {
  return error.messages && error.messages.errors && error.messages.errors[0].field
}

export const getMensagemErro = (error) => {
  const erro = error.messages && error.messages.errors && error.messages.errors[0].message

  return { mensagem: erro }
}

export const existeErroValidacao = (error) => {
  return error.messages && error.messages.errors.length > 0
}

export const formatarErroCampoObrigatorio = (campoErro) => {
  return { mensagem: `${capitalize(campoErro)} não informado` }
}

export const capitalize = (s) => {
  if (typeof s !== 'string') {
    return ''
  }
  return s.charAt(0).toUpperCase() + s.slice(1)
}
