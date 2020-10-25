import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'

import Usuario from 'App/Models/Usuario'

const SECRET = Env.get('JWT_SECRET', '@') as string

export const gerarTokenJWT = (usuario: Usuario) => {
  const secret = SECRET
  const expiresIn = 24 * 60 * 60
  const payload = {
    usuario: usuario.id,
    tipo: usuario.tipo,
  }

  const token = jwt.sign(payload, secret, {expiresIn})

  return token
}

export const getErroValidacao = (error) => {
  return error.messages && error.messages.errors && error.messages.errors[0].rule
}
