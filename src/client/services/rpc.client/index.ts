import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import { freemem, tmpdir } from "os";
import { resolve } from "path";
import { UDP_PROTOCOL_MESSAGES } from "../../../shared/constants";
import { udpClientService } from "../udp.client";
import { RPC_FUNCTION_RANDOMIZATION_PROBABILITY, RPC_HDD_SPEED_FILE_SIZE_BYTES, RPC_METHOD_PREFIX, RPC_RANDOM_DEFAULT_MAX, RPC_RANDOM_DEFAULT_MIN } from "./constants";
import { TRPCRandomNumberArgs } from "./types";



class RPCClientService {
    #capacities: string[] = [];
    constructor(){
        this.#init();
    }

    #init(){
        const rpcFunctions = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
                                .filter((fName) => fName.startsWith(RPC_METHOD_PREFIX));
        
        // randomize exposed capacities
        for (let i = 0; i < rpcFunctions.length; i++) {
            const fnIndex = Math.floor(Math.random() * rpcFunctions.length / RPC_FUNCTION_RANDOMIZATION_PROBABILITY);
            if (rpcFunctions[fnIndex] && !this.#capacities.includes(rpcFunctions[fnIndex])) {
                this.#capacities.push(rpcFunctions[fnIndex]);
            }
        }

        udpClientService.addMessageHandler(UDP_PROTOCOL_MESSAGES.CALLRPC, (payload, sender) => {
            const [ remoteFunctionName, functionArgs ] = payload;
            return this.callRpcFunction.call(this, remoteFunctionName, functionArgs);
        })
        console.log(this.capacities)
    }

    get capacities(): string[]{
        return this.#capacities.map(capName => capName.replace(`${RPC_METHOD_PREFIX}`, ''));
    }

    callRpcFunction(functionName: string, args: any){
        const normalizedFunctionName = RPC_METHOD_PREFIX + functionName;
        if (!this.#capacities.includes(normalizedFunctionName)) throw new Error('unknown function');
        const handlerFunction = (this as unknown as Record<string, Function>)[normalizedFunctionName];
        console.log({ handlerFunction, normalizedFunctionName })
        console.log({ args })
        return handlerFunction.call(this, args)
    }

    RPCrandomNumber(fnArgs: TRPCRandomNumberArgs){
        const { min, max } = { min: RPC_RANDOM_DEFAULT_MIN, max: RPC_RANDOM_DEFAULT_MAX, ...fnArgs};
        if (min > max) throw new Error('Min is greater than max')
        return Math.trunc(Math.random() * max + min);
    }

    async RPChddSpeed() {
        const startTime = performance.now();
        const testFilePath = resolve(tmpdir(), 'tmp' + randomUUID());
        const testFileContents = Buffer.alloc(RPC_HDD_SPEED_FILE_SIZE_BYTES).fill(1);
        await writeFile(testFilePath, testFileContents)
        const endTime = performance.now();
        return endTime - startTime;
    }

    RPCclientFreeMemory(){
        return freemem()
    }
}

export const rpcClientService = new RPCClientService()