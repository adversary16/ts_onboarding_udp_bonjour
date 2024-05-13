import { restServer } from "./services/http";
import { udpService } from "./services/udp";

async function bootstrap(){
    const service = udpService;
    restServer.listen(3005)
}

bootstrap().catch((error: Error) => {
    console.error('Failed to start server', error.message)
})