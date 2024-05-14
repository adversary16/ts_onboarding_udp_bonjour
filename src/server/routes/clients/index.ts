import { Request, Response, Router } from "express";
import { TClientId } from "../../../shared/types";
import { httpClientsController } from "../../controllers/clients";
import { udpService } from "../../services/udp";

const router = Router();

router.get('/', (req: Request, res: Response) => {
    const clients = udpService.clients;
    res.status(200).json(clients)
})

router.get('/:clientId', (req: Request, res: Response) => {
    const { clientId } = req.params;
   try {
    const description = udpService.getClientDescription(clientId as TClientId);
        res.status(200).json(description);
    } catch (e) {
        res.status(500).json(e);
    }

});

router.get('/:clientId/:functionName', httpClientsController.callRpcFunction.bind(httpClientsController))

export const clientRoutes = router;