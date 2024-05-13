import { Request, Response } from "express";
import { AuthError } from "../../../shared/errors";
import { TClientId } from "../../../shared/types";
import { KeyProtected } from "../../decorators/keyProtected";
import { udpService } from "../../services/udp";

class HTTPClientsController {
  @KeyProtected("key.txt")
  async callRpcFunction(req: Request, res: Response) {
    const { clientId, functionName } = req.params;
    const functionArgs = req.query;
    try {
      const { payload } = await udpService.callRPCFunction(
        clientId as TClientId,
        functionName,
        functionArgs
      );
      const sendAsString = typeof payload !== "object";
      res.status(200).json(sendAsString ? { payload } : payload);
    } catch (e) {
      const errorCode = e instanceof AuthError ? 401 : 500;
      res.status(errorCode).json((<Error>e)?.message ?? e);
    }
  }
}

export const httpClientsController = new HTTPClientsController();
