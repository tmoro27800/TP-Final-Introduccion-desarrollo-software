const { dificultad, levels, scores } = require('./db/queries')

async function main() {
  console.log('1) Leyendo dificultades...')
  const dificultades = await dificultad.getAllDificultades()
  console.log(dificultades)

  console.log('\n2) Creando un nivel de prueba...')
  const nivelPrueba = await levels.createLevel({
    name: 'Nivel de prueba (borrar)',
    order_index: 999,
    dificultad_id: dificultades[0]?.id || null,
    layout: { test: true },
  })
  console.log(nivelPrueba)

  console.log('\n3) Creando un puntaje de prueba...')
  const scorePrueba = await scores.createScore({
    level_id: nivelPrueba.id,
    player_name: 'Test',
    moves: 10,
    time_seconds: 20,
  })
  console.log(scorePrueba)

  console.log('\n4) Leyendo el ranking global...')
  const ranking = await scores.getGlobalRanking()
  console.log(ranking)

  console.log('\n5) Limpiando los datos de prueba...')
  await scores.deleteScore(scorePrueba.id)
  await levels.deleteLevel(nivelPrueba.id)
  console.log('Listo, se borró el nivel y el score de prueba.')
}

main()
  .then(() => {
    console.log('\n✅ Todo funcionó bien.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\n❌ Error:', err.message)
    process.exit(1)
  })