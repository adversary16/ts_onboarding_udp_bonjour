import { RemoteInfo } from "dgram";
import { TUDPHelloPayload } from "../../../shared/types";

export type TClientInfo = RemoteInfo & {
  lastHeartbeat: number;
  capacities: TUDPHelloPayload["capacities"];
  logo?: string;
};
