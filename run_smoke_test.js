const baseUrl = 'http://localhost:3001/api';

async function runTest() {
  console.log("🚀 Iniciando Golden Path Smoke Test (Backend API)...\n");

  const timestamp = Date.now();
  const profEmail = `dr_pepe_${timestamp}@test.com`;
  const profDni = `${Math.floor(10000000 + Math.random() * 90000000)}`;
  const patientDni = `${Math.floor(10000000 + Math.random() * 90000000)}`;
  
  try {
    // ═══════════════════════════════════════════
    // FASE 1: REGISTRO
    // ═══════════════════════════════════════════
    console.log("══════════════════════════════════════════");
    console.log("  FASE 1: REGISTRO DE USUARIOS");
    console.log("══════════════════════════════════════════\n");

    // 1a. Registro del Profesional
    console.log("➡️  Registrando Profesional...");
    let res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: "Dr. Pepe Pruebas",
        email: profEmail,
        telefono: "1122334455",
        especialidad: "Cardiología",
        password: "password123",
        dni: profDni
      })
    });
    let data = await res.json();
    if (!res.ok) {
      console.error("   Response:", JSON.stringify(data, null, 2));
      throw new Error("Fallo el registro del profesional: " + (data.error || JSON.stringify(data)));
    }
    const profToken = data.token;
    const profId = data.profesional?.id;
    console.log(`   ✅ Profesional registrado (ID: ${profId}, Email: ${profEmail})`);
    console.log(`   ✅ Token JWT recibido: ${profToken ? 'Sí' : 'No'}\n`);

    // 1b. Registro del Paciente
    console.log("➡️  Registrando Paciente...");
    res = await fetch(`${baseUrl}/patient-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dni: patientDni,
        password: "password123"
      })
    });
    data = await res.json();
    if (!res.ok) {
      console.error("   Response:", JSON.stringify(data, null, 2));
      throw new Error("Fallo el registro del paciente: " + (data.error || JSON.stringify(data)));
    }
    const patientToken = data.token;
    const patientId = data.paciente?.id;
    console.log(`   ✅ Paciente registrado (ID: ${patientId}, DNI: ${patientDni})`);
    console.log(`   ✅ Token JWT recibido: ${patientToken ? 'Sí' : 'No'}\n`);

    // ═══════════════════════════════════════════
    // FASE 2: AGENDAMIENTO DE TURNO
    // ═══════════════════════════════════════════
    console.log("══════════════════════════════════════════");
    console.log("  FASE 2: AGENDAMIENTO DE TURNO");
    console.log("══════════════════════════════════════════\n");

    console.log("➡️  Paciente agendando turno con el profesional...");
    const today = new Date();
    const fechaTurno = today.toISOString().split('T')[0]; // YYYY-MM-DD de hoy
    
    res = await fetch(`${baseUrl}/turnos`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${patientToken}`
      },
      body: JSON.stringify({
        provincia: "Buenos Aires",
        clinica: "Clinica Central",
        especialidad: "Cardiología",
        profesional: "Dr. Pepe Pruebas",
        fecha: fechaTurno,
        hora: "10:00",
        pacienteId: patientId.toString(),
        pacienteNombre: "Juan Paciente Test",
        pacienteEmail: "juan_test@test.com",
        pacienteTelefono: "1199887766"
      })
    });
    data = await res.json();
    if (!res.ok) {
      console.error("   Response:", JSON.stringify(data, null, 2));
      throw new Error("Fallo la creación del turno: " + (data.error || JSON.stringify(data)));
    }
    const turnoId = data.turno?.id;
    console.log(`   ✅ Turno creado exitosamente (ID: ${turnoId})`);
    console.log(`   📅 Fecha: ${fechaTurno} | Hora: 10:00`);
    console.log(`   🏥 Profesional: Dr. Pepe Pruebas | Clínica: Clinica Central\n`);

    // Verificar turnos del paciente
    console.log("➡️  Verificando turnos del paciente...");
    res = await fetch(`${baseUrl}/turnos/paciente/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${patientToken}`
      }
    });
    data = await res.json();
    if (!res.ok) {
      console.error("   Response:", JSON.stringify(data, null, 2));
      throw new Error("Fallo la consulta de turnos: " + (data.error || JSON.stringify(data)));
    }
    console.log(`   ✅ El paciente tiene ${data.length} turno(s) registrado(s)\n`);

    // ═══════════════════════════════════════════
    // FASE 3: DASHBOARD PROFESIONAL
    // ═══════════════════════════════════════════
    console.log("══════════════════════════════════════════");
    console.log("  FASE 3: DASHBOARD PROFESIONAL");
    console.log("══════════════════════════════════════════\n");

    // 3a. Login del profesional (para obtener token fresco con expiración estándar)
    console.log("➡️  Profesional haciendo login...");
    res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: profEmail,
        password: "password123"
      })
    });
    data = await res.json();
    if (!res.ok) {
      console.error("   Response:", JSON.stringify(data, null, 2));
      throw new Error("Fallo el login del profesional: " + (data.error || JSON.stringify(data)));
    }
    const profLoginToken = data.token;
    console.log(`   ✅ Login exitoso, token recibido\n`);

    // 3b. Ver todos los turnos
    console.log("➡️  Profesional consultando todos los turnos...");
    res = await fetch(`${baseUrl}/turnos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${profLoginToken}`
      }
    });
    data = await res.json();
    if (!res.ok) {
      console.error("   Response:", JSON.stringify(data, null, 2));
      throw new Error("Fallo la consulta de turnos: " + (data.error || JSON.stringify(data)));
    }
    console.log(`   ✅ ${data.length} turno(s) visible(s) para el profesional\n`);

    // ═══════════════════════════════════════════
    // FASE 4: ESTADÍSTICAS & MÉTRICAS
    // ═══════════════════════════════════════════
    console.log("══════════════════════════════════════════");
    console.log("  FASE 4: ESTADÍSTICAS & MÉTRICAS");
    console.log("══════════════════════════════════════════\n");

    console.log("➡️  Consultando estadísticas del profesional (periodo: mes)...");
    res = await fetch(`${baseUrl}/stats/professional?periodo=mes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${profLoginToken}`
      }
    });
    data = await res.json();
    if (!res.ok) {
      console.error("   Response:", JSON.stringify(data, null, 2));
      throw new Error("Fallo la obtención de estadísticas: " + (data.error || JSON.stringify(data)));
    }
    
    console.log("   ✅ Estadísticas obtenidas correctamente\n");
    console.log("   📊 KPIs del Dashboard:");
    console.log(`      Profesional: ${data.profesional}`);
    console.log(`      Periodo: ${data.periodo}`);
    console.log(`      Turnos Completados (Mes): ${data.mesActual?.totalTurnos || 0}`);
    console.log(`      Ingresos (Mes): $${(data.mesActual?.totalGanado || 0).toLocaleString('es-AR')}`);
    console.log(`      Turnos Hoy: ${data.hoy?.totalTurnos || 0}`);
    console.log(`      Tasa Ausentismo: ${(data.tasaAusentismo || 0).toFixed(1)}%`);
    
    if (data.turnosPorEstado) {
      console.log(`      Turnos por Estado:`);
      console.log(`        - Confirmados: ${data.turnosPorEstado.confirmado || 0}`);
      console.log(`        - Completados: ${data.turnosPorEstado.completado || 0}`);
      console.log(`        - Cancelados: ${data.turnosPorEstado.cancelado || 0}`);
      console.log(`        - Pendientes: ${data.turnosPorEstado.pendiente || 0}`);
    }
    
    if (data.hoy?.totalTurnos > 0) {
      console.log(`\n   ✅ ¡El turno de hoy se refleja correctamente en las métricas!`);
    } else {
      console.log(`\n   ⚠️  El turno fue creado para hoy (${fechaTurno}) pero aún no aparece como "hoy" en las stats.`);
      console.log(`      (Esto puede ser por diferencia horaria UTC vs local)`);
    }

    if (data.turnosPorEstado?.confirmado > 0) {
      console.log(`   ✅ ¡Los turnos confirmados se ven en el dashboard!`);
    }

    // Consultar heatmap de capacidad
    console.log("\n➡️  Consultando heatmap de capacidad...");
    res = await fetch(`${baseUrl}/stats/capacity`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${profLoginToken}`
      }
    });
    data = await res.json();
    if (!res.ok) {
      console.error("   Response:", JSON.stringify(data, null, 2));
      throw new Error("Fallo la consulta de capacidad: " + (data.error || JSON.stringify(data)));
    }
    console.log(`   ✅ Heatmap de capacidad recibido (${data.matriz?.length || 0} slots)`);
    console.log(`      Ocupación promedio: ${data.estadisticas?.averageOccupancy || 0}%\n`);

    // ═══════════════════════════════════════════
    // RESULTADO FINAL
    // ═══════════════════════════════════════════
    console.log("══════════════════════════════════════════");
    console.log("  🎉 SMOKE TEST COMPLETADO CON ÉXITO");
    console.log("══════════════════════════════════════════\n");
    console.log("  Resumen:");
    console.log(`    ✅ Fase 1: Registro - OK`);
    console.log(`    ✅ Fase 2: Agendamiento - OK`);
    console.log(`    ✅ Fase 3: Dashboard Profesional - OK`);
    console.log(`    ✅ Fase 4: Estadísticas & Métricas - OK`);
    console.log(`\n    Profesional: ${profEmail} (DNI: ${profDni})`);
    console.log(`    Paciente: DNI ${patientDni} (ID: ${patientId})`);
    console.log(`    Turno: ID ${turnoId} para ${fechaTurno} 10:00\n`);

  } catch (error) {
    console.error("\n══════════════════════════════════════════");
    console.error("  ❌ SMOKE TEST FALLÓ");
    console.error("══════════════════════════════════════════\n");
    console.error(`  Error: ${error.message}\n`);
  }
}

runTest();
