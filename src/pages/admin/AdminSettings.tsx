import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const settingsKeys = [
  { key: 'store_name', label: 'Nome da Loja' },
  { key: 'store_phone', label: 'Telefone' },
  { key: 'store_email', label: 'Email' },
  { key: 'store_instagram', label: 'Instagram' },
  { key: 'store_facebook', label: 'Facebook' },
  { key: 'footer_text', label: 'Texto do Rodapé' },
];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('store_settings').select('*').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(s => { map[s.key] = s.value; });
        setSettings(map);
      }
    });
  }, []);

  const save = async () => {
    setLoading(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('store_settings').update({ value }).eq('key', key);
    }
    toast.success('Configurações salvas!');
    setLoading(false);
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-6">Configurações</h1>
      <div className="bg-card border border-border/50 rounded-lg p-6 space-y-4 max-w-xl">
        {settingsKeys.map(({ key, label }) => (
          <div key={key}>
            <Label>{label}</Label>
            <Input value={settings[key] || ''} onChange={e => setSettings({ ...settings, [key]: e.target.value })} className="bg-secondary border-border" />
          </div>
        ))}
        <Button onClick={save} disabled={loading} className="gradient-neon text-primary-foreground font-heading">
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
