import { Request, Response, Router } from "express";
import { TClientId } from "../../../shared/types";
import { udpService } from "../../services/udp";

const router = Router();

router.get('/', (req: Request, res: Response) => {
    const clients = udpService.clients;
    res.status(200).json(clients)
})

router.get('/:clientId', (req: Request, res: Response) => {
    res.status(200).json({});
});

router.get('/:clientId/:functionName', async (req: Request, res: Response) => {
    const { clientId, functionName } = req.params;
    const functionArgs = req.query;
    try {
    const { payload } = await udpService.callRPCFunction(clientId as TClientId, functionName, functionArgs);
    const sendAsString = typeof payload !== 'object';
    res.status(200).json(sendAsString ? { payload } : payload)
    } catch (e) { 
        res.status(401).json(e);
    }

})

export const clientRoutes = router;