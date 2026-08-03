# Sistema de Gestión Veterinaria "Vidapet" 

Este proyecto contiene la arquitectura backend, definición de tipos, servicios CRUD y modelo de base de datos relacional en **Tercera Forma Normal (3FN)** adaptado a las reglas de negocio de la **Veterinaria Vidapet**.

---

## Estructura del Proyecto

```text
veterinaria/
├── src/
│   ├── config/
│   │   └── supabase.ts           # Inicialización y cliente Singleton de Supabase
│   ├── types/
│   │   └── database.types.ts     # Interfaces de TS y esquema de las 9 tablas
│   ├── services/
│   │   ├── clienteService.ts     # CRUD para CLIENTE
│   │   ├── mascotaService.ts     # CRUD para MASCOTA
│   │   ├── consultaService.ts    # CRUD para CONSULTA y relación con Tratamientos
│   │   ├── tratamientoService.ts # CRUD para el catálogo de TRATAMIENTO
│   │   ├── especialidadService.ts# CRUD para ESPECIALIDAD y relación N:M con Veterinario
│   │   └── facturaService.ts     # Generación de FACTURA (1:1) y cálculo de montos
│   └── index.ts                  # Punto de entrada y prueba completa del flujo del negocio
├── .env.example                  # Plantilla de variables de entorno
├── package.json                  # Dependencias y scripts de ejecucion
├── tsconfig.json                 # Configuración del compilador TypeScript (tipado estricto)
└── README.md                     # Documentación, DDL SQL (9 Tablas) y Justificación Técnica 3FN
```

---

##  1. Estructura DDL en SQL (9 Tablas en 3FN para Supabase SQL Editor)

## Bitácora 

###  Justificación de la 3FN y Relaciones del Negocio
1. **Resolución de la Relación Muchos a Muchos (N:M) Consulta-Tratamiento:**
   - Una consulta puede incluir múltiples tratamientos y un tratamiento se aplica en muchas consultas.
   - Para mantener la **1FN y 3FN**, creamos la tabla intermedia `consulta_tratamientos`. 
   - Guardamos aquí el atributo `costo_aplicado`, garantizando que el costo cobrado el día de la consulta no altere el catálogo ni genere dependencias transitivas en `consultas`.

2. **Resolución de la Relación Muchos a Muchos (N:M) Veterinario-Especialidad:**
   - Un veterinario puede poseer varias especialidades y una especialidad ser compartida por varios veterinarios. 
   - Se resuelve con la tabla pivot `veterinario_especialidades` con clave primaria compuesta `(id_veterinario, id_especialidad)`.

3. **Relación 1:1 Consulta-Factura:**
   - Al cerrar la consulta se emite una única factura. 
   - Definimos `id_consulta UNIQUE` en la tabla `facturas`, garantizando la relación 1 a 1 y acumulando en `monto_total` la suma matemática de los tratamientos aplicados.

### B. Prevención de Inyección SQL
- La capa de servicios utiliza exclusivamente el SDK de Supabase canalizado a través de PostgREST con **consultas HTTP parametrizadas y Sentencias Preparadas (Prepared Statements)** en PostgreSQL, imposibilitando la inyección SQL por datos ingresados de forma maliciosa.
