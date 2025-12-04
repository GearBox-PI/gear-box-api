
import '#start/env'
import hash from '@adonisjs/core/services/hash'

const password = process.argv[2]
if (!password) {
  console.error('Informe a senha como argumento!')
  process.exit(1)
}

;(async () => {
  const hashed = await hash.make(password)
  console.log(hashed)
})().catch((error) => {
  console.error('Falha ao gerar hash:', error)
  process.exit(1)
})
