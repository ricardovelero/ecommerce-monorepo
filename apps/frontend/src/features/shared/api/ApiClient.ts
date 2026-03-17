export interface ApiGetClient {
  get<T>(path: string): Promise<T>;
}
