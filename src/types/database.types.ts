export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ==========================================
// 1. CLIENTE
// ==========================================
export interface Cliente {
  id_cliente: string;
  nombre: string;
  telefono: string | null;
  email: string;
  created_at?: string;
}

export type ClienteInsert = {
  id_cliente?: string;
  nombre: string;
  telefono?: string | null;
  email: string;
  created_at?: string;
};

export type ClienteUpdate = {
  id_cliente?: string;
  nombre?: string;
  telefono?: string | null;
  email?: string;
  created_at?: string;
};

// ==========================================
// 2. VETERINARIO
// ==========================================
export interface Veterinario {
  id_veterinario: string;
  nombre: string;
  telefono: string | null;
  email: string;
  created_at?: string;
}

export type VeterinarioInsert = {
  id_veterinario?: string;
  nombre: string;
  telefono?: string | null;
  email: string;
  created_at?: string;
};

export type VeterinarioUpdate = {
  id_veterinario?: string;
  nombre?: string;
  telefono?: string | null;
  email?: string;
  created_at?: string;
};

// ==========================================
// 3. ESPECIALIDAD (Catálogo)
// ==========================================
export interface Especialidad {
  id_especialidad: string;
  nombre: string;
  descripcion: string | null;
  created_at?: string;
}

export type EspecialidadInsert = {
  id_especialidad?: string;
  nombre: string;
  descripcion?: string | null;
  created_at?: string;
};

export type EspecialidadUpdate = {
  id_especialidad?: string;
  nombre?: string;
  descripcion?: string | null;
  created_at?: string;
};

// ==========================================
// 4. VETERINARIO_ESPECIALIDAD (Intermedia N:M)
// ==========================================
export interface VeterinarioEspecialidad {
  id_veterinario: string;
  id_especialidad: string;
  created_at?: string;
}

export type VeterinarioEspecialidadInsert = {
  id_veterinario: string;
  id_especialidad: string;
  created_at?: string;
};

export type VeterinarioEspecialidadUpdate = Partial<VeterinarioEspecialidad>;

// ==========================================
// 5. MASCOTA
// ==========================================
export interface Mascota {
  id_mascota: string;
  nombre: string;
  especie: string;
  raza: string | null;
  fecha_nacimiento: string | null;
  id_cliente: string;
  created_at?: string;
}

export type MascotaInsert = {
  id_mascota?: string;
  nombre: string;
  especie: string;
  raza?: string | null;
  fecha_nacimiento?: string | null;
  id_cliente: string;
  created_at?: string;
};

export type MascotaUpdate = {
  id_mascota?: string;
  nombre?: string;
  especie?: string;
  raza?: string | null;
  fecha_nacimiento?: string | null;
  id_cliente?: string;
  created_at?: string;
};

export interface MascotaConCliente extends Mascota {
  clientes?: Cliente | null;
}

// ==========================================
// 6. CONSULTA
// ==========================================
export interface Consulta {
  id_consulta: string;
  fecha_hora: string;
  motivo: string;
  id_mascota: string;
  id_veterinario: string | null;
  created_at?: string;
}

export type ConsultaInsert = {
  id_consulta?: string;
  fecha_hora?: string;
  motivo: string;
  id_mascota: string;
  id_veterinario?: string | null;
  created_at?: string;
};

export type ConsultaUpdate = {
  id_consulta?: string;
  fecha_hora?: string;
  motivo?: string;
  id_mascota?: string;
  id_veterinario?: string | null;
  created_at?: string;
};

// ==========================================
// 7. TRATAMIENTO (Catálogo Fijo)
// ==========================================
export interface Tratamiento {
  id_tratamiento: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  created_at?: string;
}

export type TratamientoInsert = {
  id_tratamiento?: string;
  nombre: string;
  descripcion?: string | null;
  precio_base: number;
  created_at?: string;
};

export type TratamientoUpdate = {
  id_tratamiento?: string;
  nombre?: string;
  descripcion?: string | null;
  precio_base?: number;
  created_at?: string;
};

// ==========================================
// 8. CONSULTA_TRATAMIENTO (Intermedia N:M)
// ==========================================
export interface ConsultaTratamiento {
  id_consulta_tratamiento: string;
  id_consulta: string;
  id_tratamiento: string;
  costo_aplicado: number;
  observaciones: string | null;
  created_at?: string;
}

export type ConsultaTratamientoInsert = {
  id_consulta_tratamiento?: string;
  id_consulta: string;
  id_tratamiento: string;
  costo_aplicado: number;
  observaciones?: string | null;
  created_at?: string;
};

export type ConsultaTratamientoUpdate = Partial<Omit<ConsultaTratamiento, 'id_consulta_tratamiento'>>;

// ==========================================
// 9. FACTURA (Relación 1:1 con Consulta)
// ==========================================
export interface Factura {
  id_factura: string;
  numero_factura: string;
  fecha_emision: string;
  monto_total: number;
  estado: 'pendiente' | 'pagada' | 'anulada';
  id_consulta: string;
  created_at?: string;
}

export type FacturaInsert = {
  id_factura?: string;
  numero_factura?: string;
  fecha_emision?: string;
  monto_total: number;
  estado?: 'pendiente' | 'pagada' | 'anulada';
  id_consulta: string;
  created_at?: string;
};

export type FacturaUpdate = Partial<Omit<Factura, 'id_factura'>>;

// Interfaces Detalladas para Joins
export interface ConsultaDetallada extends Consulta {
  mascotas?: MascotaConCliente | null;
  veterinarios?: Veterinario | null;
  consulta_tratamientos?: (ConsultaTratamiento & { tratamientos?: Tratamiento | null })[];
  factura?: Factura | null;
}

/**
 * Esquema Completo de Base de Datos para Supabase JS v2 (9 Tablas)
 */
export type Database = {
  public: {
    Tables: {
      clientes: {
        Row: Cliente;
        Insert: ClienteInsert;
        Update: ClienteUpdate;
        Relationships: [];
      };
      veterinarios: {
        Row: Veterinario;
        Insert: VeterinarioInsert;
        Update: VeterinarioUpdate;
        Relationships: [];
      };
      especialidades: {
        Row: Especialidad;
        Insert: EspecialidadInsert;
        Update: EspecialidadUpdate;
        Relationships: [];
      };
      veterinario_especialidades: {
        Row: VeterinarioEspecialidad;
        Insert: VeterinarioEspecialidadInsert;
        Update: VeterinarioEspecialidadUpdate;
        Relationships: [
          {
            foreignKeyName: "fk_vet_esp_veterinario";
            columns: ["id_veterinario"];
            isOneToOne: false;
            referencedRelation: "veterinarios";
            referencedColumns: ["id_veterinario"];
          },
          {
            foreignKeyName: "fk_vet_esp_especialidad";
            columns: ["id_especialidad"];
            isOneToOne: false;
            referencedRelation: "especialidades";
            referencedColumns: ["id_especialidad"];
          }
        ];
      };
      mascotas: {
        Row: Mascota;
        Insert: MascotaInsert;
        Update: MascotaUpdate;
        Relationships: [
          {
            foreignKeyName: "fk_mascota_cliente";
            columns: ["id_cliente"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id_cliente"];
          }
        ];
      };
      consultas: {
        Row: Consulta;
        Insert: ConsultaInsert;
        Update: ConsultaUpdate;
        Relationships: [
          {
            foreignKeyName: "fk_consulta_mascota";
            columns: ["id_mascota"];
            isOneToOne: false;
            referencedRelation: "mascotas";
            referencedColumns: ["id_mascota"];
          },
          {
            foreignKeyName: "fk_consulta_veterinario";
            columns: ["id_veterinario"];
            isOneToOne: false;
            referencedRelation: "veterinarios";
            referencedColumns: ["id_veterinario"];
          }
        ];
      };
      tratamientos: {
        Row: Tratamiento;
        Insert: TratamientoInsert;
        Update: TratamientoUpdate;
        Relationships: [];
      };
      consulta_tratamientos: {
        Row: ConsultaTratamiento;
        Insert: ConsultaTratamientoInsert;
        Update: ConsultaTratamientoUpdate;
        Relationships: [
          {
            foreignKeyName: "fk_cons_trat_consulta";
            columns: ["id_consulta"];
            isOneToOne: false;
            referencedRelation: "consultas";
            referencedColumns: ["id_consulta"];
          },
          {
            foreignKeyName: "fk_cons_trat_tratamiento";
            columns: ["id_tratamiento"];
            isOneToOne: false;
            referencedRelation: "tratamientos";
            referencedColumns: ["id_tratamiento"];
          }
        ];
      };
      facturas: {
        Row: Factura;
        Insert: FacturaInsert;
        Update: FacturaUpdate;
        Relationships: [
          {
            foreignKeyName: "fk_factura_consulta";
            columns: ["id_consulta"];
            isOneToOne: true;
            referencedRelation: "consultas";
            referencedColumns: ["id_consulta"];
          }
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
