import { randomUUID } from "crypto";
import { TClientId, isClientId } from "../shared/types";

export const UDP_CLIENT_ID: TClientId =
  process.env.UDP_CLIENT_PERSISTENT_ID &&
  isClientId(process.env.UDP_CLIENT_PERSISTENT_ID)
    ? process.env.UDP_CLIENT_PERSISTENT_ID
    : randomUUID();
