import { RemoteInfo } from "dgram";

export type TClientInfo = RemoteInfo & { lastHeartbeat: number }