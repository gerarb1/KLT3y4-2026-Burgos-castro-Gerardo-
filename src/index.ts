import { supabase } from './config/supabase';
import { ClienteService } from './services/clienteService';
import { MascotaService } from './services/mascotaService';
import { ConsultaService } from './services/consultaService';
import { TratamientoService } from './services/tratamientoService';
import { EspecialidadService } from './services/especialidadService';
import { FacturaService } from './services/facturaService';

/**
 * Script de demostración con todas las reglas de negocio de la Veterinaria Vidapet:
 * - Clientes y Mascotas (1:N)
 * - Veterinarios y Especialidades (N:M)
 * - Catálogo de Tratamientos (N:M con costo cobrado por consulta)
 * - Cierre de Consulta y Generación de Factura (1:1)
 */
async function ejecutarDemostraciónCompleta() {
  console.log('------------------------------------------------------------');
  console.log(' SISTEMA DE GESTIÓN VETERINARIA VIDAPET (MODELO COMPLETO) ');
  console.log('------------------------------------------------------------');

  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('tu-proyecto.supabase.co')) {
    console.log('\n Configura tus credenciales reales en el archivo .env');
    return;
  }

  try {
    // 1. REGISTRAR CLIENTE Y MASCOTA
    console.log('\n--- 1. REGISTRANDO CLIENTE Y MASCOTA ---');
    const cliente = await ClienteService.crear({
      nombre: 'Carlos Mendoza',
      telefono: '+56987654321',
      email: `carlos.mendoza.${Date.now()}@vidapet.com`
    });
    console.log(' Cliente Registrado:', cliente.nombre, `(ID: ${cliente.id_cliente})`);

    const mascota = await MascotaService.crear({
      nombre: 'Rocky',
      especie: 'Canina',
      raza: 'Bulldog Francés',
      fecha_nacimiento: '2022-03-10',
      id_cliente: cliente.id_cliente
    });
    console.log(' Mascota Registrada:', mascota.nombre, `(Dueño: ${cliente.nombre})`);

    // 2. REGISTRAR VETERINARIO Y SUS ESPECIALIDADES (N:M)
    console.log('\n--- 2. VETERINARIO Y ESPECIALIDADES (N:M) ---');
    const { data: vetCreado, error: errVet } = await supabase
      .from('veterinarios')
      .insert({
        nombre: 'Dr. Alejandro Silva',
        telefono: '+56911223344',
        email: `dr.silva.${Date.now()}@vidapet.com`
      })
      .select()
      .single();

    if (errVet) throw errVet;
    console.log(' Veterinario Creado:', vetCreado.nombre);

    const espCirugia = await EspecialidadService.crear({
      nombre: `Cirugía General ${Date.now()}`,
      descripcion: 'Especialista en intervenciones quirúrgicas'
    });
    const espDermo = await EspecialidadService.crear({
      nombre: `Dermatología ${Date.now()}`,
      descripcion: 'Tratamientos para la piel y pelaje'
    });

    await EspecialidadService.asignarAVeterinario(vetCreado.id_veterinario, espCirugia.id_especialidad);
    await EspecialidadService.asignarAVeterinario(vetCreado.id_veterinario, espDermo.id_especialidad);
    console.log(' Especialidades Asignadas al Veterinario:', [espCirugia.nombre, espDermo.nombre]);

    // 3. CREAR CATÁLOGO DE TRATAMIENTOS
    console.log('\n--- 3. CATÁLOGO FIJO DE TRATAMIENTOS ---');
    const tratVacuna = await TratamientoService.crear({
      nombre: `Vacuna Antirrábica ${Date.now()}`,
      descripcion: 'Dosis anual obligatoria',
      precio_base: 15000
    });

    const tratLimpieza = await TratamientoService.crear({
      nombre: `Limpieza Dental Ultrasonido ${Date.now()}`,
      descripcion: 'Remoción de sarro y pulido',
      precio_base: 35000
    });
    console.log(' Tratamientos creados en el catálogo:', [tratVacuna.nombre, tratLimpieza.nombre]);

    // 4. CREAR CONSULTA MÉDICA
    console.log('\n--- 4. CREANDO CONSULTA MÉDICA ---');
    const consulta = await ConsultaService.crear({
      motivo: 'Control anual y profilaxis dental',
      id_mascota: mascota.id_mascota,
      id_veterinario: vetCreado.id_veterinario
    });
    console.log(' Consulta Abierta para:', mascota.nombre, `(ID: ${consulta.id_consulta})`);

    // 5. APLICAR TRATAMIENTOS A LA CONSULTA (Con costo cobrado ese día)
    console.log('\n--- 5. APLICANDO TRATAMIENTOS A LA CONSULTA ---');
    await ConsultaService.aplicarTratamiento(consulta.id_consulta, tratVacuna.id_tratamiento, 15000, 'Sin reacciones adversas');
    await ConsultaService.aplicarTratamiento(consulta.id_consulta, tratLimpieza.id_tratamiento, 32000, 'Descuento especial por cliente frecuente');
    console.log(' Tratamiento 1 Aplicado: Vacuna ($15.000)');
    console.log(' Tratamiento 2 Aplicado: Limpieza Dental ($32.000 en oferta)');

    // 6. CIERRE DE CONSULTA Y GENERACIÓN DE FACTURA (1:1)
    console.log('\n--- 6. CERRANDO CONSULTA Y GENERANDO FACTURA (1:1) ---');
    const factura = await FacturaService.generarFacturaParaConsulta(consulta.id_consulta);
    console.log(' Factura Generada:', factura.numero_factura);
    console.log(' Monto Total Calculado:', `$${factura.monto_total}`);
    console.log(' Estado:', factura.estado);

    // Cambiar estado a pagada
    const facturaPagada = await FacturaService.cambiarEstado(factura.id_factura, 'pagada');
    console.log(' Estado de Factura Actualizado:', facturaPagada.estado);

    // 7. CONSULTAR DETALLE COMPLETO CON RELACIONES JOIN
    console.log('\n--- 7. OBTENIENDO DETALLE COMPLETO DE LA CONSULTA ---');
    const consultaCompleta = await ConsultaService.obtenerPorId(consulta.id_consulta);
    console.log(' Consulta Detallada:', JSON.stringify(consultaCompleta, null, 2));

    console.log('\n ¡DEMOSTRACIÓN DE TODAS LAS REGLAS DE NEGOCIO EJECUTADA CON ÉXITO! ');
  } catch (error: any) {
    console.error(' Error durante la prueba:', error.message || error);
  }
}

ejecutarDemostraciónCompleta();
