import { UDP_SERVICE_SERVER_PORT } from "../shared/config";
import { udpService } from "./services/udp";

async function bootstrap(){
    const service = udpService;
    service.broadcast(UDP_SERVICE_SERVER_PORT + 1, 'lol')
}

bootstrap().catch((error: Error) => {
    console.error('Failed to start server', error.message)
})