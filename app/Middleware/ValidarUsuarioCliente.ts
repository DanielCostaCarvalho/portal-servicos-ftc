import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ValidarUsuarioCliente {
  public async handle (ctx: HttpContextContract, next: () => Promise<void>) {
    const usuario = ctx.request.input('usuario')

    if(usuario.tipo === 'Cliente') {
      await next()
    } else {
      return ctx.response.forbidden({
        mensagem: 'Você não tem permissão pra realizar essa ação',
      })
    }
  }
}
