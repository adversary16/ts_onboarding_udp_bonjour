import { createHash } from "crypto";

export const KEYPROTECTED_HASH_ALGORITHM = "sha256";

export const hashString = (openString: string) =>
  createHash(KEYPROTECTED_HASH_ALGORITHM).update(openString).digest("hex");
