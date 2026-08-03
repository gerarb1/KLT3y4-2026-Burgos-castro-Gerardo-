import { supabase } from '../config/supabase';
import { Tratamiento, TratamientoInsert, TratamientoUpdate } from '../types/database.types';

export class TratamientoService {
  /**
   * Registra un nuevo Tratamiento en el catálogo de la veterinaria.
   */
  static async crear(datosTratamiento: TratamientoInsert): Promise<Tratamiento> {
    try {
      const { data, error } = await supabase
        .from('tratamientos')
        .insert(datosTratamiento)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear tratamiento: ${error.message} (Código: ${error.code})`);
      }

      if (!data) {
        throw new Error('No se retornaron los datos del tratamiento creado.');
      }

      return data as Tratamiento;
    } catch (err: any) {
      console.error('[TratamientoService.crear]', err.message || err);
      throw err;
    }
  }

  /**
   * Obtiene el catálogo completo de Tratamientos registrados.
   */
  static async obtenerTodos(): Promise<Tratamiento[]> {
    try {
      const { data, error } = await supabase
        .from('tratamientos')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) {
        throw new Error(`Error al obtener catálogo de tratamientos: ${error.message} (Código: ${error.code})`);
      }

      return (data as Tratamiento[]) || [];
    } catch (err: any) {
      console.error('[TratamientoService.obtenerTodos]', err.message || err);
      throw err;
    }
  }

  /**
   * Obtiene un Tratamiento por su id_tratamiento.
   */
  static async obtenerPorId(id_tratamiento: string): Promise<Tratamiento | null> {
    try {
      const { data, error } = await supabase
        .from('tratamientos')
        .select('*')
        .eq('id_tratamiento', id_tratamiento)
        .maybeSingle();

      if (error) {
        throw new Error(`Error al obtener tratamiento por ID: ${error.message} (Código: ${error.code})`);
      }

      return (data as Tratamiento) || null;
    } catch (err: any) {
      console.error('[TratamientoService.obtenerPorId]', err.message || err);
      throw err;
    }
  }

  /**
   * Actualiza los datos de un Tratamiento del catálogo.
   */
  static async actualizar(id_tratamiento: string, datosActualizar: TratamientoUpdate): Promise<Tratamiento> {
    try {
      const { data, error } = await supabase
        .from('tratamientos')
        .update(datosActualizar)
        .eq('id_tratamiento', id_tratamiento)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar tratamiento: ${error.message} (Código: ${error.code})`);
      }

      if (!data) {
        throw new Error(`No se encontró el tratamiento con ID ${id_tratamiento} para actualizar.`);
      }

      return data as Tratamiento;
    } catch (err: any) {
      console.error('[TratamientoService.actualizar]', err.message || err);
      throw err;
    }
  }

  /**
   * Elimina un Tratamiento del catálogo.
   */
  static async eliminar(id_tratamiento: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tratamientos')
        .delete()
        .eq('id_tratamiento', id_tratamiento);

      if (error) {
        throw new Error(`Error al eliminar tratamiento: ${error.message} (Código: ${error.code})`);
      }

      return true;
    } catch (err: any) {
      console.error('[TratamientoService.eliminar]', err.message || err);
      throw err;
    }
  }
}
