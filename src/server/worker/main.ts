import { claimNextJob } from "../jobs/repository";
import { processGenerationJob } from "./process-job";

const DEFAULT_POLL_INTERVAL_MS = 2000;

function pollIntervalMs(): number {
  const configured = Number(process.env.WORKER_POLL_INTERVAL_MS);

  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_POLL_INTERVAL_MS;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function runWorker(): Promise<void> {
  const intervalMs = pollIntervalMs();

  for (;;) {
    const job = await claimNextJob();

    if (!job) {
      await sleep(intervalMs);
      continue;
    }

    try {
      await processGenerationJob(job.id);
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "Unknown worker loop error"
      );
    }
  }
}

if (require.main === module) {
  runWorker().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
