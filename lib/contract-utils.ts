import {
    bufferCV,
    ClarityValue,
    cvToValue,
    fetchCallReadOnlyFunction,
    listCV,
    makeSTXTokenTransfer,
    noneCV,
    PostConditionMode,
    principalCV,
    someCV,
    stringAsciiCV,
    stringUtf8CV,
    tupleCV,
    uintCV,
} from '@stacks/transactions';
import { CONTRACT_CONFIG } from './contract-config';
  
  /**
   * Base function for read-only contract calls
   * Use this to fetch data from the blockchain without spending gas
   */
  export async function callReadOnly<T = any>(
    functionName: string,
    functionArgs: ClarityValue[] = [],
    senderAddress?: string
  ): Promise<T> {
    try {
      const response = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
        contractName: CONTRACT_CONFIG.CONTRACT_NAME,
        functionName,
        functionArgs,
        senderAddress: senderAddress || CONTRACT_CONFIG.CONTRACT_ADDRESS,
        network: CONTRACT_CONFIG.NETWORK,
      });
  
      // Convert Clarity value to JavaScript value
      return cvToValue(response) as T;
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error);
      throw error;
    }
  }
  
  /**
   * Prepare transaction options for contract calls
   * Returns options that can be used with transaction signing
   */
  export function prepareContractCall(
    functionName: string,
    functionArgs: ClarityValue[] = []
  ) {
    return {
      contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
      contractName: CONTRACT_CONFIG.CONTRACT_NAME,
      functionName,
      functionArgs,
      postConditionMode: PostConditionMode.Allow,
      network: CONTRACT_CONFIG.NETWORK,
    };
  }
  
  /**
   * Prepare STX transfer transaction
   */
  export async function prepareSTXTransfer(
    recipientAddress: string,
    amount: number, // in microSTX
    senderPrivateKey: string,
    memo?: string
  ) {
    const txOptions = {
      recipient: recipientAddress,
      amount: amount,
      senderKey: senderPrivateKey,
      network: CONTRACT_CONFIG.NETWORK,
      memo: memo,
      anchorMode: 'any' as const,
    };
  
    return await makeSTXTokenTransfer(txOptions);
  }
  
  /**
   * Clarity Value Helpers
   * Use these to convert JavaScript values to Clarity types
   */
  export const clarityHelpers = {
    uint: (value: number) => uintCV(value),
    stringAscii: (value: string) => stringAsciiCV(value),
    stringUtf8: (value: string) => stringUtf8CV(value),
    principal: (address: string) => principalCV(address),
    tuple: (data: Record<string, ClarityValue>) => tupleCV(data),
    list: (items: ClarityValue[]) => listCV(items),
    some: (value: ClarityValue) => someCV(value),
    none: () => noneCV(),
    buffer: (value: Buffer) => bufferCV(value),
  };


// ===========================================
// USER REGISTRATION FUNCTIONS
// ===========================================

/**
 * Register a user with a unique username
 * @param username - Username (max 50 characters)
 * @returns Transaction options
 */
export async function registerUser(username: string) {
    const functionArgs = [stringUtf8CV(username)];
    return prepareContractCall('register-user', functionArgs);
  }

  /**
 * Get user registration data
 * @param userAddress - User's Stacks address
 * @returns User data or null
 */
export async function getUser(userAddress: string) {
    return await callReadOnly('get-user', [principalCV(userAddress)]);
  }