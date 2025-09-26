// import { ethers } from 'ethers';
// import { newKit } from '@celo/contractkit';
// import ERC20ABI from '@openzeppelin/contracts/build/contracts/ERC20.json';
// import { AbiItem } from 'web3-utils'; 

// // Cast nécessaire car les types OpenZeppelin et Web3 sont incompatibles
// // C'est un problème connu de l'écosystème Web3/TypeScript
// export const ERC20_ABI = ERC20ABI.abi as AbiItem[];

// // Initialise le kit Celo avec l'URL du nœud (par défaut Alfajores)
// // eslint-disable-next-line n/no-process-env
// const CELO_RPC_URL = process.env.CELO_RPC_URL_TEST ?? 
//   'https://alfajores-forno.celo-testnet.org';
// const kit = newKit(CELO_RPC_URL);

// // Adresse du contrat cUSD sur Celo Alfajores (testnet)
// // eslint-disable-next-line n/no-process-env
// const CUSD_ADDRESS = process.env.CUSD_ADDRESS_TEST ?? 
//   '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1';

// // Interface pour typer les méthodes du contrat
// interface ContractMethods {
//   balanceOf: (address: string) => {
//     call: () => Promise<string>,
//   };
//   transfer: (to: string, amount: string) => {
//     estimateGas: (options: { from: string }) => Promise<number>,
//     send: (options: { 
//       from: string, 
//       gas: number, 
//       feeCurrency: string,
//     }) => Promise<{ transactionHash: string }>,
//   };
//   decimals: () => {
//     call: () => Promise<string>,
//   };
// }

// export function createWallet() {
//   const wallet = ethers.Wallet.createRandom();  
//   return {
//     address: wallet.address,
//     privateKey: wallet.privateKey,
//     mnemonic: wallet.mnemonic?.phrase,
//   };
// }

// /**
//  * Crée un nouveau wallet Celo (clé privée, adresse, mnemonic)
//  */
// export function createCeloWallet() {
//   const account = kit.web3.eth.accounts.create();
//   return {
//     address: account.address,
//     privateKey: account.privateKey,
//     // Pas de mnemonic direct avec web3, à gérer séparément si besoin
//   };
// }

// /**
//  * Charge un wallet existant à partir d'une clé privée (ethers)
//  */
// export function loadWallet() {
//   // Pour Celo, privilégier loadCeloWallet
//   return ethers.Wallet.createRandom(); // Placeholder, à adapter si besoin
// }

// export function loadCeloWallet(privateKey: string) {
//   return kit.web3.eth.accounts.privateKeyToAccount(privateKey);
// }

// /**
//  * Récupère le solde cUSD d'une adresse Celo (via contrat ERC20)
//  */
// export async function getCusdBalance(address: string): Promise<string> {
//   const contract = new kit.web3.eth.Contract(
//     ERC20_ABI as any,
//     CUSD_ADDRESS,
//   ) as unknown as { methods: ContractMethods };
  
//   const rawBalance = await contract.methods.balanceOf(address).call();
//   const decimalsStr = await contract.methods.decimals().call();
//   const decimals = parseInt(decimalsStr, 10);
  
//   return (Number(rawBalance) / 10 ** decimals).toString();
// }

// /**
//  * Envoie des cUSD depuis un wallet vers une adresse (via contrat ERC20)
//  */
// export async function sendCusd(
//   privateKey: string,
//   to: string,
//   amount: string, // en cUSD (ex: "10.5")
// ): Promise<{ txHash: string }> {
//   const account = loadCeloWallet(privateKey);
//   kit.connection.addAccount(account.privateKey);

//   const contract = new kit.web3.eth.Contract(
//     ERC20_ABI as any,
//     CUSD_ADDRESS,
//   ) as unknown as { methods: ContractMethods };
  
//   // cUSD a 18 décimales, on utilise toWei directement
//   const amountInUnits = kit.web3.utils.toWei(amount, 'ether');

//   const tx = contract.methods.transfer(to, amountInUnits);
//   const gas = await tx.estimateGas({ from: account.address });
//   const receipt = await tx.send({
//     from: account.address,
//     gas,
//     feeCurrency: CUSD_ADDRESS,
//   });
  
//   return { txHash: receipt.transactionHash };
// }