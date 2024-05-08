import { rpcClientService } from "./services/rpc.client";
import { udpClientService } from "./services/udp.client";

async function bootstrap() {
    const udp = udpClientService;
    const rpc = rpcClientService;
}

bootstrap();