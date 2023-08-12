import { Chain, chainsInfo } from "@/types"
import { ethers } from "ethers"

export const DGNX_ADDRESS = '0x51e48670098173025c477d9aa3f0eff7bf9f7812'
export const DISBURSER_ADDRESS = '0x8a0E3264Da08bf999AfF5a50AabF5d2dc89fab79'

export const addressHasDisburserRewards = async (address: string) => {
    const provider = new ethers.providers.JsonRpcProvider(chainsInfo[Chain.AVAX].rpc)
    const contract = new ethers.Contract(DISBURSER_ADDRESS, [
        'function hasAmountLeft(address addr) public view returns (bool)'
    ], provider)

    return contract.hasAmountLeft(address);
}