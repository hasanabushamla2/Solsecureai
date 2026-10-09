import { isAllowedIP } from "./ssrf";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { Agent, buildConnector } from "undici";

export function createSecureAgent(){
    const connector = buildConnector({
        lookup: async (hostname,options,callback) =>{
            try{
                const addresses = await lookup(hostname,{
                    all: true
                });

                for(const e of addresses) {
                    const host = e.address.replace(/^\[|\]$/g,"");
                    if(!isAllowedIP(host)){
                        return callback(new Error("Address Blocked!"),[])
                    }
                }
                
                if(options.all){
                    return callback(null,addresses)
                }
                callback(null,addresses[0].address,addresses[0].family);
            }
            catch (err:any){
                return callback(new Error("Endpoint is not allowed!"),[])
            }
        }
    });
    const secureAgent = new Agent({
    connect: (opts,callback)=>{
        const host = opts.hostname.replace(/^\[|\]$/g,"");

        if(isIP(host)!==0){
            if(!isAllowedIP(host)){
                return callback(new Error("Address Blocked!"), null);
            }
        }

        connector(opts,callback);
    }
  });
  return secureAgent;
}