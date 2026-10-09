import { isIP } from "node:net";
import * as ipaddr from "ipaddr.js";
import { lookup } from "node:dns/promises";

export async function checkUrl(eUrl: string): Promise<boolean>{
    try{
        const url = new URL(eUrl);
        if(url.protocol !== "https:"){
            return false;
        }
        if(url.port !== "" && url.port !== "443"){
            return false;
        }
        if(url.username || url.password){
            return false;
        }
        const host = url.hostname.replace(/^\[|\]$/g,"");
        if(isIP(host)!==0){
            return isAllowedIP(host);
        }
        
        const addresses = await lookup(host,{all:true});
        if(addresses.length===0){
            return false;
        }

        for(const a of addresses){
            if(!isAllowedIP(a.address)){
                return false;
            }
        }
        return true;
    }
    catch(err:unknown){
        console.error(err);
        return false;
    }

}

export function isAllowedIP(address:string) : boolean {
    const ip = ipaddr.process(address);

    return ip.range()==='unicast';
}

