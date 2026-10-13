import { getModelRadar } from "@/lib/model-radar";

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  return Response.json(await getModelRadar(), {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
