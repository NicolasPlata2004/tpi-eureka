const { getUsers, getUnitsForUser, getSiguienteRetoRecomendado } = require('../src/lib/db.ts');

try {
  const users = getUsers();
  console.log(`Encontrados ${users.length} usuarios.`);
  for (const u of users) {
    console.log(`Probando usuario: ${u.name} (${u.role})`);
    const units = getUnitsForUser(u.id);
    console.log(`- Unidades obtenidas: ${units.length}`);
    const nextReto = getSiguienteRetoRecomendado(u.id);
    console.log(`- Siguiente reto:`, nextReto ? nextReto.leccionId : 'Ninguno');
  }
  console.log('✅ Todos los usuarios pasaron la prueba de backend.');
} catch (err) {
  console.error('❌ Error detectado en el backend:', err);
}
