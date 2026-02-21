import React, { useState, useEffect } from 'react';
import './Settings.css';

interface ProviderInfo {
  name: string;
  label: string;
}

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
}

interface ConnectionResult {
  success: boolean;
  message: string;
  models?: ModelInfo[];
}

export function Settings() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [models, setModels] = useState<Record<string, ModelInfo[]>>({});
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, ConnectionResult>>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [editingKeys, setEditingKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProviders();
    loadSettings();
  }, []);

  async function loadProviders() {
    const res = await fetch('/api/providers');
    const data = await res.json();
    setProviders(data);
  }

  async function loadSettings() {
    const res = await fetch('/api/settings');
    const data = await res.json();
    setSettings(data);
    if (data.selected_models) {
      try {
        setSelectedModels(JSON.parse(data.selected_models));
      } catch {
        setSelectedModels([]);
      }
    }
  }

  async function loadModels(providerName: string) {
    try {
      const res = await fetch(`/api/providers/${providerName}/models`);
      const data = await res.json();
      setModels((prev) => ({ ...prev, [providerName]: data }));
    } catch {
      setModels((prev) => ({ ...prev, [providerName]: [] }));
    }
  }

  async function testConnection(providerName: string) {
    setTestingProvider(providerName);
    try {
      const res = await fetch(`/api/providers/${providerName}/test`, { method: 'POST' });
      const result: ConnectionResult = await res.json();
      setConnectionStatus((prev) => ({ ...prev, [providerName]: result }));
      if (result.success && result.models) {
        setModels((prev) => ({ ...prev, [providerName]: result.models! }));
      }
    } catch (err) {
      setConnectionStatus((prev) => ({
        ...prev,
        [providerName]: { success: false, message: '接続テストに失敗しました' },
      }));
    } finally {
      setTestingProvider(null);
    }
  }

  function handleSettingChange(key: string, value: string) {
    setEditingKeys((prev) => ({ ...prev, [key]: value }));
  }

  function getSettingValue(key: string): string {
    if (key in editingKeys) return editingKeys[key];
    return settings[key] || '';
  }

  function handleModelToggle(modelId: string) {
    setSelectedModels((prev) =>
      prev.includes(modelId) ? prev.filter((m) => m !== modelId) : [...prev, modelId]
    );
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage('');
    try {
      const updates: Record<string, string> = { ...editingKeys };
      updates.selected_models = JSON.stringify(selectedModels);

      if (updates.active_provider === undefined && settings.active_provider) {
        updates.active_provider = settings.active_provider;
      }
      if (updates.active_model === undefined && settings.active_model) {
        updates.active_model = settings.active_model;
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setSaveMessage('設定を保存しました');
        setEditingKeys({});
        await loadSettings();
      } else {
        setSaveMessage('設定の保存に失敗しました');
      }
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  }

  function getProviderSettingsKeys(providerName: string): { apiKey?: string; baseUrl: string } {
    switch (providerName) {
      case 'anthropic':
        return { apiKey: 'anthropic_api_key', baseUrl: 'anthropic_base_url' };
      case 'openai':
        return { apiKey: 'openai_api_key', baseUrl: 'openai_base_url' };
      case 'gemini':
        return { apiKey: 'gemini_api_key', baseUrl: 'gemini_base_url' };
      case 'ollama':
        return { baseUrl: 'ollama_base_url' };
      default:
        return { baseUrl: '' };
    }
  }

  function getDefaultBaseUrl(providerName: string): string {
    switch (providerName) {
      case 'anthropic': return 'https://api.anthropic.com';
      case 'openai': return 'https://api.openai.com/v1';
      case 'gemini': return 'https://generativelanguage.googleapis.com';
      case 'ollama': return 'http://localhost:11434';
      default: return '';
    }
  }

  const allModels = Object.entries(models).flatMap(([, ms]) => ms);

  return (
    <div className="settings-page">
      <div className="settings-content">
        <h2 className="settings-title">設定</h2>

        <section className="settings-section">
          <h3>使用するプロバイダーとモデル</h3>
          <div className="active-provider-select">
            <label>アクティブプロバイダー:</label>
            <select
              value={getSettingValue('active_provider') || 'anthropic'}
              onChange={(e) => handleSettingChange('active_provider', e.target.value)}
            >
              {providers.map((p) => (
                <option key={p.name} value={p.name}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="active-provider-select">
            <label>アクティブモデル:</label>
            <input
              type="text"
              value={getSettingValue('active_model') || ''}
              onChange={(e) => handleSettingChange('active_model', e.target.value)}
              placeholder="例: claude-3-5-haiku-20241022"
            />
          </div>
        </section>

        {providers.map((provider) => {
          const keys = getProviderSettingsKeys(provider.name);
          const status = connectionStatus[provider.name];
          const providerModels = models[provider.name] || [];

          return (
            <section key={provider.name} className="settings-section provider-section">
              <div className="provider-header">
                <h3>{provider.label}</h3>
                <div className="provider-actions">
                  <button
                    className="test-btn"
                    onClick={() => testConnection(provider.name)}
                    disabled={testingProvider === provider.name}
                  >
                    {testingProvider === provider.name ? 'テスト中...' : '接続テスト'}
                  </button>
                  <button
                    className="load-models-btn"
                    onClick={() => loadModels(provider.name)}
                  >
                    モデル取得
                  </button>
                </div>
              </div>

              {status && (
                <div className={`connection-status ${status.success ? 'success' : 'error'}`}>
                  <span className="status-icon">{status.success ? '\u2713' : '\u2717'}</span>
                  <span>{status.message}</span>
                </div>
              )}

              <div className="provider-fields">
                {keys.apiKey && (
                  <div className="field-group">
                    <label>APIキー:</label>
                    <input
                      type="password"
                      value={getSettingValue(keys.apiKey)}
                      onChange={(e) => handleSettingChange(keys.apiKey!, e.target.value)}
                      placeholder="APIキーを入力"
                    />
                  </div>
                )}
                <div className="field-group">
                  <label>エンドポイントURL:</label>
                  <input
                    type="text"
                    value={getSettingValue(keys.baseUrl) || ''}
                    onChange={(e) => handleSettingChange(keys.baseUrl, e.target.value)}
                    placeholder={getDefaultBaseUrl(provider.name)}
                  />
                </div>
              </div>

              {providerModels.length > 0 && (
                <div className="models-list">
                  <h4>利用可能なモデル ({providerModels.length})</h4>
                  <div className="models-grid">
                    {providerModels.map((model) => (
                      <label key={model.id} className="model-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedModels.includes(`${provider.name}:${model.id}`)}
                          onChange={() => handleModelToggle(`${provider.name}:${model.id}`)}
                        />
                        <span className="model-name">{model.name || model.id}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}

        {selectedModels.length > 0 && (
          <section className="settings-section">
            <h3>選択済みモデル ({selectedModels.length})</h3>
            <div className="selected-models">
              {selectedModels.map((m) => (
                <span key={m} className="selected-model-tag">
                  {m}
                  <button onClick={() => handleModelToggle(m)}>&times;</button>
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="settings-actions">
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '設定を保存'}
          </button>
          {saveMessage && (
            <span className={`save-message ${saveMessage.includes('失敗') ? 'error' : 'success'}`}>
              {saveMessage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
