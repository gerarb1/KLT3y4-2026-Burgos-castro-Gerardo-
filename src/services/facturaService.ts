import { supabase } from '../config/supabase';
import { Factura, FacturaInsert, FacturaUpdate } from '../types/database.types';

export class FacturaService {
  /**
   * Genera automáticamente una Factura al cerrar una Consulta médica.
   * Suma el costo_aplicado de todos los tratamientos asignados a esa consulta.
   */
  static async generarFacturaParaConsulta(id_consulta: string): Promise<Factura> {
    try {
      // 1. Obtener la suma total de los tratamientos aplicados en la consulta
      const { data: tratamientos, error: errorTratamientos } = await supabase
        .from('consulta_tratamientos')
        .select('costo_aplicado')
        .eq('id_consulta', id_consulta);

      if (errorTratamientos) {
        throw new Error(`Error al obtener los tratamientos de la consulta: ${errorTratamientos.message}`);
      }

      const montoTotal = (tratamientos || []).reduce(
        (acum: number, t: any) => acum + Number(t.costo_aplicado || 0),
        0
      );

      // Generar número correlativo de factura
      const numeroFactura = `FAC-${Date.now().toString().slice(-6)}`;

      // 2. Insertar la nueva factura (Relación 1:1 con Consulta)
      const datosFactura: FacturaInsert = {
        id_consulta,
        numero_factura: numeroFactura,
        monto_total: montoTotal,
        estado: 'pendiente',
        fecha_emision: new Date().toISOString()
      };

      const { data: facturaCreada, error: errorFactura } = await supabase
        .from('facturas')
        .insert(datosFactura)
        .select()
        .single();

      if (errorFactura) {
        throw new Error(`Error al generar la factura: ${errorFactura.message} (Código: ${errorFactura.code})`);
      }

      if (!facturaCreada) {
        throw new Error('No se retornado la factura generada.');
      }

      return facturaCreada as Factura;
    } catch (err: any) {
      console.error('[FacturaService.generarFacturaParaConsulta]', err.message || err);
      throw err;
    }
  }

  /**
   * Obtiene una Factura por su id_factura.
   */
  static async obtenerPorId(id_factura: string): Promise<Factura | null> {
    try {
      const { data, error } = await supabase
        .from('facturas')
        .select('*, consultas(*)')
        .eq('id_factura', id_factura)
        .maybeSingle();

      if (error) {
        throw new Error(`Error al obtener factura por ID: ${error.message} (Código: ${error.code})`);
      }

      return (data as unknown as Factura) || null;
    } catch (err: any) {
      console.error('[FacturaService.obtenerPorId]', err.message || err);
      throw err;
    }
  }

  /**
   * Obtiene la Factura asociada a una Consulta específica (Relación 1:1).
   */
  static async obtenerPorConsulta(id_consulta: string): Promise<Factura | null> {
    try {
      const { data, error } = await supabase
        .from('facturas')
        .select('*')
        .eq('id_consulta', id_consulta)
        .maybeSingle();

      if (error) {
        throw new Error(`Error al obtener factura por Consulta: ${error.message} (Código: ${error.code})`);
      }

      return (data as Factura) || null;
    } catch (err: any) {
      console.error('[FacturaService.obtenerPorConsulta]', err.message || err);
      throw err;
    }
  }

  /**
   * Actualiza el estado de la Factura ('pendiente' | 'pagada' | 'anulada').
   */
  static async cambiarEstado(id_factura: string, estado: 'pendiente' | 'pagada' | 'anulada'): Promise<Factura> {
    try {
      const { data, error } = await supabase
        .from('facturas')
        .update({ estado })
        .eq('id_factura', id_factura)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar estado de la factura: ${error.message} (Código: ${error.code})`);
      }

      return data as Factura;
    } catch (err: any) {
      console.error('[FacturaService.cambiarEstado]', err.message || err);
      throw err;
    }
  }
}
