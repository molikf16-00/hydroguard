import {
  mkdir,
  readFile,
  writeFile,
  rename,
  readdir,
  unlink,
} from "node:fs/promises";
import path from "node:path";
import { DEFAULT_CATCHMENT_CONFIG } from "../src/config/catchmentConfig";
import {
  fetchBundle,
  processBundle,
  type RawBundle,
  type LiveCatchmentState,
} from "../src/utils/openMeteo";
import { cacheAgeMinutes } from "../src/utils/dataQuality";

/** Single-process, fixed-catchment collector. Browsers cannot set upstream URLs. */
export class Collector {
  private bundle: RawBundle | null = null;
  private pending: Promise<void> | null = null;
  lastError: string | null = null;
  lastSuccess: string | null = null;
  constructor(private directory: string) {}
  async restore() {
    try {
      const saved = JSON.parse(
        await readFile(path.join(this.directory, "latest.json"), "utf8"),
      ) as RawBundle;
      if (cacheAgeMinutes(saved.fetchedAtIso) === null) return;
      const expectedKey = DEFAULT_CATCHMENT_CONFIG.villages
        .map((v) => `${v.lat.toFixed(4)},${v.lon.toFixed(4)}`)
        .join("|");
      if (saved.coordKey !== expectedKey) return;
      processBundle(
        saved,
        DEFAULT_CATCHMENT_CONFIG,
        new Date(saved.fetchedAtIso),
        true,
        0,
      );
      this.bundle = saved;
      this.lastSuccess = saved.fetchedAtIso;
      this.lastError = "Restored cached snapshot; awaiting fresh collection.";
    } catch {
      /* A missing or invalid snapshot never becomes data. */
    }
  }
  refresh(): Promise<void> {
    if (this.pending) return this.pending;
    this.pending = this.collect().finally(() => {
      this.pending = null;
    });
    return this.pending;
  }
  private async collect() {
    try {
      const next = await fetchBundle(DEFAULT_CATCHMENT_CONFIG);
      processBundle(
        next,
        DEFAULT_CATCHMENT_CONFIG,
        new Date(next.fetchedAtIso),
        false,
        0,
      );
      this.bundle = next;
      this.lastSuccess = next.fetchedAtIso;
      this.lastError = null;
      await mkdir(this.directory, { recursive: true });
      await writeFile(
        path.join(this.directory, "latest.tmp"),
        JSON.stringify(next),
      );
      await rename(
        path.join(this.directory, "latest.tmp"),
        path.join(this.directory, "latest.json"),
      );
      const snapshots = path.join(this.directory, "snapshots");
      await mkdir(snapshots, { recursive: true });
      await writeFile(
        path.join(snapshots, next.fetchedAtIso.replaceAll(":", "-") + ".json"),
        JSON.stringify(next),
      );
      // Keep up to 7 days of 10-minute raw snapshots; rotation is bounded.
      const files = (await readdir(snapshots))
        .filter((f) => f.endsWith(".json"))
        .sort();
      for (const file of files.slice(0, Math.max(0, files.length - 1008)))
        await unlink(path.join(snapshots, file));
    } catch (error) {
      this.lastError =
        error instanceof Error ? error.message : "Collection failed";
      console.error("Collection error:", this.lastError);
    }
  }
  current(): LiveCatchmentState | null {
    if (!this.bundle) return null;
    const age = cacheAgeMinutes(this.bundle.fetchedAtIso);
    if (age === null) return null;
    return processBundle(
      this.bundle,
      DEFAULT_CATCHMENT_CONFIG,
      new Date(this.bundle.fetchedAtIso),
      !!this.lastError || age >= 15,
      Math.round(age),
    );
  }
}
