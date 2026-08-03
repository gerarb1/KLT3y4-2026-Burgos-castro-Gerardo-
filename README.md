# 🐾 Sistema de Gestión Veterinaria "Vidapet" (Backend TS + Supabase)

Este proyecto contiene la arquitectura backend, definición de tipos, servicios CRUD y modelo de base de datos relacional en **Tercera Forma Normal (3FN)** adaptado a las reglas de negocio de la **Veterinaria Vidapet**.

---

## 📁 Estructura del Proyecto

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

## 🗄️ 1. Estructura DDL en SQL (9 Tablas en 3FN para Supabase SQL Editor)

Ejecuta el siguiente script en el **SQL Editor** de Supabase para crear las 9 tablas relacionales con sus Claves Primarias, Claves Foráneas y Deshabilitación de RLS:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================
-- 1. TABLA: CLIENTES
-- ===================================================
CREATE TABLE IF NOT EXISTS public.clientes (
    id_cliente UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- 2. TABLA: VETERINARIOS
-- ===================================================
CREATE TABLE IF NOT EXISTS public.veterinarios (
    id_veterinario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- 3. TABLA: ESPECIALIDADES (Catálogo)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.especialidades (
    id_especialidad UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- 4. TABLA INTERMEDIA: VETERINARIO_ESPECIALIDADES (N:M)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.veterinario_especialidades (
    id_veterinario UUID NOT NULL,
    id_especialidad UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id_veterinario, id_especialidad),
    CONSTRAINT fk_vet_esp_veterinario FOREIGN KEY (id_veterinario) REFERENCES public.veterinarios(id_veterinario) ON DELETE CASCADE,
    CONSTRAINT fk_vet_esp_especialidad FOREIGN KEY (id_especialidad) REFERENCES public.especialidades(id_especialidad) ON DELETE CASCADE
);

-- ===================================================
-- 5. TABLA: MASCOTAS (1:N con Cliente)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.mascotas (
    id_mascota UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raza VARCHAR(50),
    fecha_nacimiento DATE,
    id_cliente UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_mascota_cliente FOREIGN KEY (id_cliente) REFERENCES public.clientes (id_cliente) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===================================================
-- 6. TABLA: CONSULTAS (1:N con Mascota y Veterinario)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.consultas (
    id_consulta UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    motivo TEXT NOT NULL,
    id_mascota UUID NOT NULL,
    id_veterinario UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_consulta_mascota FOREIGN KEY (id_mascota) REFERENCES public.mascotas (id_mascota) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_consulta_veterinario FOREIGN KEY (id_veterinario) REFERENCES public.veterinarios (id_veterinario) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ===================================================
-- 7. TABLA: TRATAMIENTOS (Catálogo Fijo)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.tratamientos (
    id_tratamiento UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(120) NOT NULL UNIQUE,
    descripcion TEXT,
    precio_base NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- 8. TABLA INTERMEDIA: CONSULTA_TRATAMIENTOS (N:M)
-- Almacena el costo_aplicado cobrado ese día
-- ===================================================
CREATE TABLE IF NOT EXISTS public.consulta_tratamientos (
    id_consulta_tratamiento UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_consulta UUID NOT NULL,
    id_tratamiento UUID NOT NULL,
    costo_aplicado NUMERIC(10,2) NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_cons_trat_consulta FOREIGN KEY (id_consulta) REFERENCES public.consultas(id_consulta) ON DELETE CASCADE,
    CONSTRAINT fk_cons_trat_tratamiento FOREIGN KEY (id_tratamiento) REFERENCES public.tratamientos(id_tratamiento) ON DELETE RESTRICT
);

-- ===================================================
-- 9. TABLA: FACTURAS (1:1 con Consulta)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.facturas (
    id_factura UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_factura VARCHAR(50) NOT NULL UNIQUE,
    fecha_emision TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    monto_total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'anulada')),
    id_consulta UUID NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_factura_consulta FOREIGN KEY (id_consulta) REFERENCES public.consultas(id_consulta) ON DELETE CASCADE
);

-- ===================================================
-- ÍNDICES DE RENDIMIENTO
-- ===================================================
CREATE INDEX IF NOT EXISTS idx_mascotas_id_cliente ON public.mascotas(id_cliente);
CREATE INDEX IF NOT EXISTS idx_consultas_id_mascota ON public.consultas(id_mascota);
CREATE INDEX IF NOT EXISTS idx_consultas_id_veterinario ON public.consultas(id_veterinario);
CREATE INDEX IF NOT EXISTS idx_cons_trat_consulta ON public.consulta_tratamientos(id_consulta);

-- ===================================================
-- DESHABILITAR RLS PARA PRUEBAS DESDE BACKEND (anon key)
-- ===================================================
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.especialidades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinario_especialidades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mascotas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tratamientos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.consulta_tratamientos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas DISABLE ROW LEVEL SECURITY;
```

---

## 🚀 2. Ejecución Local

```bash
# Compilar TypeScript sin errores
npx tsc --noEmit

# Ejecutar script completo de demostración del negocio
npm run dev
```

---

## 📝 3. Justificación Técnica para Bitácora y Defensa

### A. Justificación de la 3FN y Relaciones del Negocio
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
