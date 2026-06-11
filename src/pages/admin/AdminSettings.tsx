import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const settingsKeys = [
  { key: 'store_name', label: 'Nome da loja' },
  { key: 'store_phone', label: 'Telefone' },
  { key: 'store_email', label: 'Email' },
  { key: 'store_instagram', label: 'Instagram' },
  { key: 'store_facebook', label: 'Facebook' },
  { key: 'footer_text', label: 'Texto do rodape' },
];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('store_settings').select('*').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(s => { map[s.key] = s.value; });
        setSettings({ default_margin_percent: '35', ...map });
      }
    });
  }, []);

  const save = async () => {
    setLoading(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('store_settings').upsert({ key, value }, { onConflict: 'key' });
    }
    toast.success('Configuracoes salvas!');
    setLoading(false);
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-6">Configuracoes</h1>
      <div className="bg-card border border-border/50 rounded-lg p-6 space-y-4 max-w-xl">
        {settingsKeys.map(({ key, label }) => (
          <div key={key}>
            <Label>{label}</Label>
            <Input value={settings[key] || ''} onChange={e => setSettings({ ...settings, [key]: e.target.value })} className="bg-secondary border-border" />
          </div>
        ))}

        <div>
          <Label>Margem padrao</Label>
          <Select value={settings.default_margin_percent || '35'} onValueChange={(value) => setSettings({ ...settings, default_margin_percent: value })}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30%</SelectItem>
              <SelectItem value="35">35%</SelectItem>
              <SelectItem value="40">40%</SelectItem>
              <SelectItem value="50">50%</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={save} disabled={loading} className="gradient-neon text-primary-foreground font-heading">
          {loading ? 'Salvando...' : 'Salvar configuracoes'}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
