import { useEffect, useState } from 'react';
import { unitTransactionItemService, UnitFormulaInput, UnitFormulaResult } from '@/services/unitTransactionItem.service';

export function useUnitFormula(form: UnitFormulaInput) {
  const [formula, setFormula] = useState<UnitFormulaResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qty = Number(form.qty_total ?? 0);
    const price = Number(form.price ?? 0);

    if (!qty || qty <= 0 || !price || price < 0) {
      setFormula(null);
      setLoading(false);
      return;
    }

    let active = true;

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await unitTransactionItemService.getFormula({
          qty_total: qty,
          price,
          bbn_price: Number(form.bbn_price ?? 0),
          expedition_fee: Number(form.expedition_fee ?? 0),
          other_fee: Number(form.other_fee ?? 0),
          dpp_tax_id: form.dpp_tax_id,
          ppn_tax_id: form.ppn_tax_id,
        });

        if (!active) return;
        setFormula(result);
      } catch {
        if (!active) return;
        setFormula(null);
      } finally {
        if (active) setLoading(false);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [form.qty_total, form.price, form.bbn_price, form.expedition_fee, form.other_fee, form.dpp_tax_id, form.ppn_tax_id]);

  return { formula, loading };
}
