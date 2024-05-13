import { AuthError, ConfigError } from "../../../shared/errors";

export const KEYPROTECTED_ERROR_KEYFILE_MISSING = new ConfigError(
  "keyprotected",
  "Missing keyfile"
);
export const KEYPROTECTED_ERROR_WRONG_PASSWORD = new AuthError(
  "Password mismatch"
);
