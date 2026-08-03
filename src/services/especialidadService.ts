import { supabase } from '../config/supabase';
import { Especialidad, EspecialidadInsert, VeterinarioEspecialidad } from '../types/database.types';

export class EspecialidadService {
  /**
   * Registra una nueva Especialidad en el catálogo.
   */
  static async crear(datosEspecialidad: EspecialidadInsert): Promise<Especialidad> {
    try {
      const { data, error } = await supabase
        .from('especialidades')
        .insert(datosEspecialidad)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear especialidad: ${error.message} (Código: ${error.code})`);
      }

      return data as Especialidad;
    } catch (err: any) {
      console.error('[EspecialidadService.crear]', err.message || err);
      throw err;
    }
  }

  /**
   * Obtiene la lista completa de Especialidades.
   */
  static async obtenerTodos(): Promise<Especialidad[]> {
    try {
      const { data, error } = await supabase
        .from('especialidades')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) {
        throw new Error(`Error al obtener especialidades: ${error.message} (Código: ${error.code})`);
      }

      return (data as Especialidad[]) || [];
    } catch (err: any) {
      console.error('[EspecialidadService.obtenerTodos]', err.message || err);
      throw err;
    }
  }

  /**
   * Asigna una Especialidad del catálogo a un Veterinario (Relación N:M).
   */
  static async asignarAVeterinario(id_veterinario: string, id_especialidad: string): Promise<VeterinarioEspecialidad> {
    try {
      const { data, error } = await supabase
        .from('veterinario_especialidades')
        .insert({ id_veterinario, id_especialidad })
        .select()
        .single();

      if (error) {
        throw new Error(`Error al asignar especialidad a veterinario: ${error.message} (Código: ${error.code})`);
      }

      return data as VeterinarioEspecialidad;
    } catch (err: any) {
      console.error('[EspecialidadService.asignarAVeterinario]', err.message || err);
      throw err;
    }
  }

  /**
   * Obtiene todas las Especialidades asignadas a un Veterinario específico.
   */
  static async obtenerPorVeterinario(id_veterinario: string): Promise<Especialidad[]> {
    try {
      const { data, error } = await supabase
        .from('veterinario_especialidades')
        .select('especialidades(*)')
        .eq('id_veterinario', id_veterinario);

      if (error) {
        throw new Error(`Error al obtener especialidades del veterinario: ${error.message} (Código: ${error.code})`);
      }

      const lista = (data || []).map((item: any) => item.especialidades).filter(Boolean);
      return lista as Especialidad[];
    } catch (err: any) {
      console.error('[EspecialidadService.obtenerPorVeterinario]', err.message || err);
      throw err;
    }
  }
}
