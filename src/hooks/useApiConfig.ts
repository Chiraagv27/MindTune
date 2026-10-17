import { useEffect, useState } from 'react';

import type { ProviderId } from '@/lib/types';

interface ApiConfigResponse {
  providers: Record<ProviderId, boolean>;
}

export function useApiConfig() {
  const [config, setConfig] = useState<ApiConfigResponse | null>(null);

  useEffect(() => {
    fetch('/api/config')
      .then(async (r) => {
        const ct = r.headers.get('content-type') ?? '';
        if (!r.ok || !ct.includes('application/json')) {
          throw new Error('config unavailable');
        }
        return r.json() as Promise<ApiConfigResponse>;
      })
      .then((data) => setConfig(data))
      .catch(() =>
        setConfig({
          providers: {
            google: false,
            openai: false,
            anthropic: false,
            groq: false,
          },
        }),
      );
  }, []);

  const hasServerKey = (provider: ProviderId) => Boolean(config?.providers?.[provider]);

  return { config, hasServerKey };
}
