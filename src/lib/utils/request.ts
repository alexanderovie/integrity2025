import { NextRequest } from "next/server";
import { validatePayloadSize } from "@/lib/validations/schemas";

/**
 * Helper para parsear y validar el body de una request
 * Maneja correctamente la lectura única del body
 */
export async function parseRequestBody<T = unknown>(
  request: NextRequest
): Promise<{ body: T; bodyText: string }> {
  const bodyText = await request.text();

  // Validar tamaño del payload
  if (!validatePayloadSize(bodyText)) {
    throw new Error("Payload too large");
  }

  // Parsear JSON
  let body: T;
  try {
    body = JSON.parse(bodyText) as T;
  } catch (error) {
    throw new Error("Invalid JSON format");
  }

  return { body, bodyText };
}
