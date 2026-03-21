import "server-only";

import { queryRaw } from "@/lib/db/neon";
import { logServicesFallback, withServicesTimeout } from "@/lib/services/shared";

export async function probeServicesDatabaseConnection(): Promise<boolean> {
  try {
    await withServicesTimeout(
      queryRaw("SELECT 1 AS ok", undefined, {
        name: "services_probe_select_1",
        context: "services-probe",
      }),
    );
    return true;
  } catch (error) {
    logServicesFallback("services-probe", "select-1", error);
    return false;
  }
}
