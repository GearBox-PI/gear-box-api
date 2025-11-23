import type { HttpContext } from '@adonisjs/core/http'
import { createServiceValidator, updateServiceValidator } from '#validators/services_validator'
import ServicesService from '#services/services_service'
import { inject } from '@adonisjs/core'

const MECHANIC_ROLE = 'mecanico'
const VIEW_FORBIDDEN = {
  error:
    'Você não tem permissão para acessar este registro. Apenas o responsável pelo orçamento/serviço ou o dono podem visualizar este conteúdo.',
}
const EDIT_FORBIDDEN = {
  error:
    'Você não tem permissão para editar este registro. Somente o responsável pelo orçamento/serviço pode realizar alterações, ou o dono do sistema.',
}
const UPDATE_FORBIDDEN = {
  error:
    'A atualização não pode ser realizada. Este orçamento/serviço não foi criado por você. Apenas o responsável ou o dono têm permissão para modificar este item.',
}

@inject()
export default class ServicesController {
  constructor(private servicesService: ServicesService) {}

  // Listar serviços (dono e mecânico)
  async index({ request, auth }: HttpContext) {
    const page = Number(request.input('page', 1))
    const perPage = Math.min(Number(request.input('perPage', 10)), 100)

    return this.servicesService.list({ page, perPage, authUser: auth.user })
  }

  // Detalhar serviço
  async show({ params, response, auth }: HttpContext) {
    const result = await this.servicesService.get({ id: params.id, authUser: auth.user })
    if (result.status === 'not_found') return response.notFound({ error: 'Serviço não encontrado' })
    if (result.status === 'forbidden') return response.forbidden(VIEW_FORBIDDEN)
    if (result.status === 'validation')
      return response.unprocessableEntity({ errors: result.errors })
    if (result.status !== 'ok')
      return response.internalServerError({ error: 'Falha ao buscar serviço.' })
    return result.data
  }

  // Criar serviço (dono e mecânico)
  async store({ auth, request, response }: HttpContext) {
    const payload = await createServiceValidator.validate(request.all())

    const result = await this.servicesService.create({ ...payload, authUser: auth.user })

    if (result.status === 'validation')
      return response.unprocessableEntity({ errors: result.errors })

    if (result.status !== 'ok')
      return response.internalServerError({ error: 'Falha ao criar serviço.' })
    return response.created(result.data)
  }

  // Atualizar serviço (dono ou mecânico para status)
  async update({ auth, params, request, response }: HttpContext) {
    const data = await updateServiceValidator.validate(request.all())

    const result = await this.servicesService.update({
      id: params.id,
      data,
      authUser: auth.user,
    })

    if (result.status === 'forbidden') {
      return response.forbidden(
        auth.user?.tipo === MECHANIC_ROLE ? EDIT_FORBIDDEN : UPDATE_FORBIDDEN
      )
    }
    if (result.status === 'not_found') return response.notFound({ error: 'Serviço não encontrado' })
    if (result.status === 'validation')
      return response.unprocessableEntity({ errors: result.errors })

    if (result.status !== 'ok')
      return response.internalServerError({ error: 'Falha ao atualizar serviço.' })
    return result.data
  }

  // Remover serviço (apenas dono)
  async destroy({ auth, params, response }: HttpContext) {
    const result = await this.servicesService.delete({ id: params.id, authUser: auth.user })
    if (result.status === 'forbidden')
      return response.forbidden({ error: 'Apenas donos podem remover' })
    if (result.status === 'not_found') return response.notFound({ error: 'Serviço não encontrado' })
    return response.noContent()
  }
}
