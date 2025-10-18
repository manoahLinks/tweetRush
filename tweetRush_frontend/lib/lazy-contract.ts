/**
 * Lazy Contract Loading
 * 
 * Defers loading of heavy blockchain dependencies until they're actually needed
 */

let contractUtils: any = null;
let contractConfig: any = null;

export const loadContractUtils = async () => {
  if (contractUtils) return contractUtils;
  
  console.log("[LazyContract] Loading contract utilities...");
  
  // Lazy load contract utilities
  contractUtils = await import('./contract-utils');
  contractConfig = await import('./contract-config');
  
  console.log("[LazyContract] Contract utilities loaded");
  return contractUtils;
};

export const loadContractConfig = async () => {
  if (contractConfig) return contractConfig;
  
  contractConfig = await import('./contract-config');
  return contractConfig;
};

// Preload critical contract functions
export const preloadContract = async () => {
  try {
    await loadContractUtils();
    await loadContractConfig();
    console.log("[LazyContract] Contract preloaded successfully");
  } catch (error) {
    console.error("[LazyContract] Failed to preload contract:", error);
  }
};
