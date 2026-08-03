import { supabase } from '../config/supabase';
import {
  Consulta,
  ConsultaInsert,
  ConsultaUpdate,
  ConsultaDetallada,
  ConsultaTratamiento
} from '../types/database.types';

export class ConsultaService {
  /**
   * Registra una nueva Consulta médica veterinaria.
   */
  static async crear(datosConsulta: ConsultaInsert): Promise<Consulta> {
    try {
      const { data, error } = await supabase
        .from('consultas')
        .insert(datosConsulta)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear consulta: ${error.message} (Código: ${error.code})`);
      }

      if (!data) {
        throw new Error('No se retornaron los datos de la consulta creada.');
      }

      return data as Consulta;
    } catch (err: any) {
      console.error('[ConsultaService.crear]', err.message || err);
      throw err;
    }
  }

  /**
   * Aplica un tratamiento a una Consulta médica especificando el costo cobrado en ese momento.
   */
  static async aplicarTratamiento(
    id_consulta: string,
    id_tratamiento: string,
    costo_aplicado: number,
    observaciones?: string
  ): Promise<ConsultaTratamiento> {
    try {
      const { data, error } = await supabase
        .from('consulta_tratamientos')
        .insert({
          id_consulta,
          id_tratamiento,
          costo_aplicado,
          observaciones: observaciones || null
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error al aplicar tratamiento a la consulta: ${error.message} (Código: ${error.code})`);
      }

      return data as ConsultaTratamiento;
    } catch (err: any) {
      console.error('[ConsultaService.aplicarTratamiento]', err.message || err);
      throw err;
    }
  }

  /**
   * Obtiene todas las Consultas con información relacional completa (Mascota, Cliente, Veterinario, Tratamientos y Factura).
   */
  static async obtenerTodos(): Promise<ConsultaDetallada[]> {
    try {
      const { data, error } = await supabase
        .from('consultas')
        .select(`
          *,
          mascotas (
            *,
            clientes (*)
          ),
          veterinarios (*),
          consulta_tratamientos (
            *,
            tratamientos (*)
          ),
          facturas (*)
        `)
        .order('fecha_hora', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener consultas: ${error.message} (Código: ${error.code})`);
      }

      return (data as unknown as ConsultaDetallada[]) || [];
    } catch (err: any) {
      console.error('[ConsultaService.obtenerTodos]', err.message || err);
      throw err;
    }
  }

  /**
   * Obtiene una Consulta por su id_consulta con detalles completos de tratamientos y factura.
   */
  static async obtenerPorId(id_consulta: string): Promise<ConsultaDetallada | null> {
    try {
      const { data, error } = await supabase
        .from('consultas')
        .select(`
          *,
          mascotas (
            *,
            clientes (*)
          ),
          veterinarios (*),
          consulta_tratamientos (
            *,
            tratamientos (*)
          ),
          facturas (*)
        `)
        .eq('id_consulta', id_consulta)
        .maybeSingle();

      if (error) {
        throw new Error(`Error al obtener consulta por ID: ${error.message} (Código: ${error.code})`);
      }

      return (data as unknown as ConsultaDetallada) || null;
    } catch (err: any) {
      console.error('[ConsultaService.obtenerPorId]', err.message || err);
      throw err;
    }
  }

  /**
   * Obtiene el historial de Consultas médicas de una Mascota específica.
   */
  static async obtenerPorMascota(id_mascota: string): Promise<ConsultaDetallada[]> {
    try {
      const { data, error } = await supabase
        .from('consultas')
        .select(`
          *,
          mascotas (*),
          veterinarios (*),
          consulta_tratamientos (
            *,
            tratamientos (*)
          ),
          facturas (*)
        `)
        .eq('id_mascota', id_mascota)
        .order('fecha_hora', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener consultas por mascota: ${error.message} (Código: ${error.code})`);
      }

      return (data as unknown as ConsultaDetallada[]) || [];
    } catch (err: any) {
      console.error('[ConsultaService.obtenerPorMascota]', err.message || err);
      throw err;
    }
  }

  /**
   * Actualiza la información de una Consulta médica.
   */
  static async actualizar(id_consulta: string, datosActualizar: ConsultaUpdate): Promise<Consulta> {
    try {
      const { data, error } = await supabase
        .from('consultas')
        .update(datosActualizar)
        .eq('id_consulta', id_consulta)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar consulta: ${error.message} (Código: ${error.code})`);
      }

      if (!data) {
        throw new Error(`No se encontró la consulta con ID ${id_consulta} para actualizar.`);
      }

      return data as Consulta;
    } catch (err: any) {
      console.error('[ConsultaService.actualizar]', err.message || err);
      throw err;
    }
  }

  /**
   * Elimina un registro de Consulta.
   */
  static async eliminar(id_consulta: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('consultas')
        .delete()
        .eq('id_consulta', id_consulta);

      if (error) {
        throw new Error(`Error al eliminar consulta: ${error.message} (Código: ${error.code})`);
      }

      return true;
    } catch (err: any) {
      console.error('[ConsultaService.eliminar]', err.message || err);
      throw err;
    }
  }
}
