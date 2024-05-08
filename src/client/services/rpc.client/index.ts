const FUNCTION_RANDOMIZATION_PROBABILITY = 0.75;

class RPCClientService {
    #capacities: string[] = [];
    constructor(){
        this.#init();
    }
    #init(){
        const rpcFunctions = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
                                .filter((fName) => fName.startsWith('rpc'));
        
        // randomize exposed capacities
        for (let i = 0; i < rpcFunctions.length; i++) {
            const fnIndex = Math.floor(Math.random() * rpcFunctions.length / FUNCTION_RANDOMIZATION_PROBABILITY);
            if (rpcFunctions[fnIndex] && !this.#capacities.includes(rpcFunctions[fnIndex])) {
                this.#capacities.push(rpcFunctions[fnIndex]);
            }
        }
        console.log(this.#capacities)
    }

    get capacities(): string[]{
        return this.#capacities;
    }

    rpcRandomNumber(){

    }

    rpcGetHddSpeed(){

    }

    rpcGetFreeMem(){
        
    }
}

export const rpcClientService = new RPCClientService()