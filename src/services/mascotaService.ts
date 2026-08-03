import { supabase } from '../config/supabase';
import { Mascota, MascotaInsert, MascotaUpdate } from '../types/database.types';

export class MascotaService {
  /**
   * Registra una nueva Mascota asociada a un Cliente existente.
   */
  static async crear(datosMascota: MascotaInsert): Promise<Mascota> {
    try {
      const { data, error } = await supabase
        .from('mascotas')
        .insert(datosMascota)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear mascota: ${error.message} (Código: ${error.code})`);
      }

      if (!data) {
        throw new Error('No se retornaron los datos de la mascota creada.');
      }

      return data as Mascota;
    } catch (err: any) {
      console.error('[MascotaService.crear]', err.message || err);
      throw err;
    }
  }

  /**
   * Obtiene el listado completo de Mascotas con los datos del Cliente dueño mediante JOIN.
   */
  static async obtenerTodos(): Promise<Mascota[]> {
    try {
      const { data, error } = await supabase
        .from('mascotas')
        .select('*, clientes(*)')
        .order('nombre', { ascending: true });

      if (error) {
        throw new Error(`Error al obtener mascotas: ${error.message} (Código: ${error.code})`);
      }

      return (data as unknown as Mascota[]) || [];
    } catch (err: any) {
      console.error('[MascotaService.obtenerTodos]', err.message || err);
      throw err;
    }
  }

  /**
   * Obtiene una Mascota específica por su id_mascota.
   */
  static async obtenerPorId(id_mascota: string): Promise<Mascota | null> {
    try {
      const { data, error } = await supabase
        .from('mascotas')
        .select('*, clientes(*)')
        .eq('id_mascota', id_mascota)
        .maybeSingle();

      if (error) {
        throw new Error(`Error al obtener mascota por ID: ${error.message} (Código: ${error.code})`);
      }

      return (data as unknown as Mascota) || null;
    } catch (err: any) {
      console.error('[MascotaService.obtenerPorId]', err.message || err);
      throw err;
    }
  }

  /**
   * Obtiene todas las Mascotas pertenecientes a un Cliente específico (FK id_cliente).
   */
  static async obtenerPorCliente(id_cliente: string): Promise<Mascota[]> {
    try {
      const { data, error } = await supabase
        .from('mascotas')
        .select('*')
        .eq('id_cliente', id_cliente)
        .order('nombre', { ascending: true });

      if (error) {
        throw new Error(`Error al obtener mascotas del cliente: ${error.message} (Código: ${error.code})`);
      }

      return (data as Mascota[]) || [];
    } catch (err: any) {
      console.error('[MascotaService.obtenerPorCliente]', err.message || err);
      throw err;
    }
  }

  /**
   * Actualiza la información de una Mascota.
   */
  static async actualizar(id_mascota: string, datosActualizar: MascotaUpdate): Promise<Mascota> {
    try {
      const { data, error } = await supabase
        .from('mascotas')
        .update(datosActualizar)
        .eq('id_mascota', id_mascota)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar mascota: ${error.message} (Código: ${error.code})`);
      }

      if (!data) {
        throw new Error(`No se encontró la mascota con ID ${id_mascota} para actualizar.`);
      }

      return data as Mascota;
    } catch (err: any) {
      console.error('[MascotaService.actualizar]', err.message || err);
      throw err;
    }
  }

  /**
   * Elimina una Mascota de la base de datos.
   */
  static async eliminar(id_mascota: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('mascotas')
        .delete()
        .eq('id_mascota', id_mascota);

      if (error) {
        throw new Error(`Error al eliminar mascota: ${error.message} (Código: ${error.code})`);
      }

      return true;
    } catch (err: any) {
      console.error('[MascotaService.eliminar]', err.message || err);
      throw err;
    }
  }
}
