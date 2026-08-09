import type { Provider, ProviderFormData } from "./types";

export interface BootstrapData {
  providers: Provider[];
  categories: string[];
  towns: string[];
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export function fetchBootstrap(): Promise<BootstrapData> {
  return request<BootstrapData>("/api/bootstrap");
}

export function createProvider(data: ProviderFormData): Promise<Provider> {
  return request<Provider>("/api/providers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProvider(
  id: string,
  data: ProviderFormData,
): Promise<Provider> {
  return request<Provider>(`/api/providers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProvider(id: string): Promise<void> {
  return request<void>(`/api/providers/${id}`, { method: "DELETE" });
}

export function toggleProviderVerified(id: string): Promise<Provider> {
  return request<Provider>(`/api/providers/${id}/verified`, {
    method: "PATCH",
  });
}

export function createCategory(name: string): Promise<{ name: string }> {
  return request<{ name: string }>("/api/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function renameCategory(
  oldName: string,
  newName: string,
): Promise<{ name: string }> {
  return request<{ name: string }>(
    `/api/categories/${encodeURIComponent(oldName)}`,
    {
      method: "PUT",
      body: JSON.stringify({ name: newName }),
    },
  );
}

export function deleteCategory(name: string): Promise<void> {
  return request<void>(`/api/categories/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
}

export function createTown(name: string): Promise<{ name: string }> {
  return request<{ name: string }>("/api/towns", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function renameTown(
  oldName: string,
  newName: string,
): Promise<{ name: string }> {
  return request<{ name: string }>(
    `/api/towns/${encodeURIComponent(oldName)}`,
    {
      method: "PUT",
      body: JSON.stringify({ name: newName }),
    },
  );
}

export function deleteTown(name: string): Promise<void> {
  return request<void>(`/api/towns/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
}
