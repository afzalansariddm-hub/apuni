export interface Provider {
  id: string;
  name: string;
  phone: string;
  category: string;
  town: string;
  description: string;
  verified: boolean;
}

export type ProviderFormData = Omit<Provider, "id">;

export type AdminScreen = "home" | "providers" | "categories" | "cities";
