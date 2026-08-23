export type JsonErrorPayload = { error?: string; [key: string]: unknown };

type ResponseLike = {
  ok: boolean;
  status: number;
  text(): Promise<string>;
};

export async function readJsonResponse(response: ResponseLike): Promise<JsonErrorPayload> {
  const raw = await response.text();
  if (!raw.trim()) {
    return { error: `Server returned an empty response (HTTP ${response.status}).` };
  }
  try {
    return JSON.parse(raw) as JsonErrorPayload;
  } catch {
    return { error: `Server returned a non-JSON response (HTTP ${response.status}).` };
  }
}
