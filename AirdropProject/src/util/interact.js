import { ethers } from 'ethers';
import { Contract } from "@ethersproject/contracts";
import { useContractCall, useContractFunction } from '@usedapp/core';

import { 
  suniTokenAddress, 
  airdropContractAddress 
} from '../contract_ABI/vestingData';

const airdropContractAbi = require('../contract_ABI/airdrop_contract_abi.json');
const suniContractAbi = require('../contract_ABI/suni_contract_abi.json');

const airdropContractInterface = new ethers.utils.Interface(airdropContractAbi);
const suniContractInterface = new ethers.utils.Interface(suniContractAbi);

const airdropContract = new Contract(airdropContractAddress, airdropContractInterface);
const suniContract = new Contract(suniTokenAddress, suniContractInterface);

/** functions for the vesting contract */
//get status of contract hook
export function useGetLastClaimedTime(account, tokenId) {
    const [timestamp] = useContractCall({
      abi: airdropContractInterface,
      address: airdropContractAddress,
      method: 'getLastClaimedTime',
      args: [account, tokenId],
    }) ?? [];
    return timestamp;
}

export function useGetTotalClaimableAmount(tokenIds, startTimestamps) {
  const [amount] = useContractCall({
    abi: airdropContractInterface,
    address: airdropContractAddress,
    method: 'getAmount',
    args: [tokenIds, startTimestamps],
  }) ?? [];
  return amount;
}

// send transaction hook
export function useAirdropContractMethod(methodName) {
    console.log('methodName', airdropContract);
    const { state, send, events } = useContractFunction(airdropContract, methodName, {});
    return { state, send, events };
}

export function useSuniContractMethod(methodName) {
    const { state, send, events } = useContractFunction(suniContract, methodName, {});
    return { state, send, events };
}

/** the end for the vesting */
