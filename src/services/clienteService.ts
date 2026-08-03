import { supabase } from '../config/supabase';
import { Cliente, ClienteInsert, ClienteUpdate } from '../types/database.types';

export class ClienteService {
  /**
   * Crea un nuevo registro de Cliente en la base de datos.
   */
  static async crear(datosCliente: ClienteInsert): Promise<Cliente> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert(datosCliente)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear cliente: ${error.message} (Código: ${error.code})`);
      }

      if (!data) {
        throw new Error('No se retornó el cliente creado.');
      }

      return data as Cliente;
    } catch (err: any) {
      console.error('[ClienteService.crear]', err.message || err);
      throw err;
    }
  }

  /**
   * Obtiene la lista completa de Clientes registrados.
   */
  static async obtenerTodos(): Promise<Cliente[]> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) {
        throw new Error(`Error al obtener clientes: ${error.message} (Código: ${error.code})`);
      }

      return (data as Cliente[]) || [];
    } catch (err: any) {
      console.error('[ClienteService.obtenerTodos]', err.message || err);
      throw err;
    }
  }

  /**
   * Obtiene un Cliente por su identificador único (id_cliente).
   */
  static async obtenerPorId(id_cliente: string): Promise<Cliente | null> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id_cliente', id_cliente)
        .maybeSingle();

      if (error) {
        throw new Error(`Error al obtener cliente por ID: ${error.message} (Código: ${error.code})`);
      }

      return data as Cliente | null;
    } catch (err: any) {
      console.error('[ClienteService.obtenerPorId]', err.message || err);
      throw err;
    }
  }

  /**
   * Actualiza los datos de un Cliente existente.
   */
  static async actualizar(id_cliente: string, datosActualizar: ClienteUpdate): Promise<Cliente> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(datosActualizar)
        .eq('id_cliente', id_cliente)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar cliente: ${error.message} (Código: ${error.code})`);
      }

      if (!data) {
        throw new Error(`No se encontró el cliente con ID ${id_cliente} para actualizar.`);
      }

      return data as Cliente;
    } catch (err: any) {
      console.error('[ClienteService.actualizar]', err.message || err);
      throw err;
    }
  }

  /**
   * Elimina un Cliente por su identificador único.
   */
  static async eliminar(id_cliente: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id_cliente', id_cliente);

      if (error) {
        throw new Error(`Error al eliminar cliente: ${error.message} (Código: ${error.code})`);
      }

      return true;
    } catch (err: any) {
      console.error('[ClienteService.eliminar]', err.message || err);
      throw err;
    }
  }
}
