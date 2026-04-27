"use client";

export function ProviderForm() {
  return (
    <form>
      <label>
        Provider name
        <input name="name" placeholder="OpenAI proxy" />
      </label>
      <label>
        Type
        <select name="type" defaultValue="OPENAI_COMPATIBLE">
          <option value="OPENAI_OFFICIAL">OpenAI official</option>
          <option value="OPENAI_COMPATIBLE">OpenAI compatible</option>
          <option value="CUSTOM_HTTP">Custom HTTP</option>
        </select>
      </label>
      <label>
        Base URL
        <input name="baseUrl" placeholder="https://api.example.com/v1" />
      </label>
      <label>
        API key
        <input name="apiKey" type="password" />
      </label>
      <label>
        Default model
        <input name="model" placeholder="gpt-image-2" />
      </label>
      <label>
        <input name="enabled" type="checkbox" defaultChecked />
        Enabled
      </label>
      <button type="submit">Save provider</button>
    </form>
  );
}
