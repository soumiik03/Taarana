import { db, eq } from "@repo/database";
import { featureRequestsTable } from "@repo/database/schema";

async function main() {
  const id = "a1665806-8a23-474c-80e6-030659b4687a";
  await db.update(featureRequestsTable).set({ status: "ready" }).where(eq(featureRequestsTable.id, id));
  console.log("Updated status to ready");
  process.exit(0);
}
main().catch(console.error);
