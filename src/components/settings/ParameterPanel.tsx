"use client";

import React from "react";

export type ParameterPanelValue = {
  providerId: string;
  modelId: string;
  size: string;
  count: number;
  quality: string;
};

type Option = {
  id: string;
  name: string;
};

type ParameterPanelProps = {
  value: ParameterPanelValue;
  providers: Option[];
  models: Option[];
  onChange: (value: ParameterPanelValue) => void;
};

const sizes = ["1024x1024", "1536x1024", "1024x1536"];
const qualities = ["standard", "high"];

export function ParameterPanel({
  value,
  providers,
  models,
  onChange
}: ParameterPanelProps) {
  function update(next: Partial<ParameterPanelValue>) {
    onChange({ ...value, ...next });
  }

  return (
    <aside aria-label="Generation parameters">
      <h2>Parameters</h2>
      <label>
        Provider
        <select
          value={value.providerId}
          onChange={(event) => update({ providerId: event.target.value })}
        >
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Model
        <select
          value={value.modelId}
          onChange={(event) => update({ modelId: event.target.value })}
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Size
        <select
          value={value.size}
          onChange={(event) => update({ size: event.target.value })}
        >
          {sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <label>
        Quality
        <select
          value={value.quality}
          onChange={(event) => update({ quality: event.target.value })}
        >
          {qualities.map((quality) => (
            <option key={quality} value={quality}>
              {quality}
            </option>
          ))}
        </select>
      </label>
      <label>
        Count
        <input
          min={1}
          max={8}
          type="number"
          value={value.count}
          onChange={(event) => update({ count: Number(event.target.value) })}
        />
      </label>
    </aside>
  );
}
