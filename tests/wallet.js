"use strict";
// import { describe, it, expect } from 'vitest';
// // Configuration des variables d'environnement pour les tests
// const CELO_RPC_URL = process.env.CELO_RPC_URL_TEST ?? 
//   'https://alfajores-forno.celo-testnet.org';
// const CUSD_ADDRESS = process.env.CUSD_ADDRESS_TEST ?? 
//   '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1';
// // Définir les variables d'environnement
// process.env.CELO_RPC_URL_TEST = CELO_RPC_URL;
// process.env.CUSD_ADDRESS_TEST = CUSD_ADDRESS;
// import {
//   createWallet,
//   createCeloWallet,
//   loadCeloWallet,
//   // getCusdBalance, // integration-level
//   // sendCusd,       // integration-level
// } from '../src/services/blockchain/blockchain.service';
// describe('blockchain.service (unit tests, no mocks)', () => {
//   it('createWallet returns a valid EVM wallet (ethers)', () => {
//     const w = createWallet();
//     expect(w.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
//     expect(w.privateKey).toMatch(/^0x[0-9a-fA-F]{64}$/);
//     const hasMnemonic = typeof w.mnemonic === 'string' || 
//       typeof w.mnemonic === 'undefined';
//     expect(hasMnemonic).toBe(true);
//   });
//   it('createCeloWallet returns an address and a private key ' +
//     '(no mnemonic)', () => {
//     const w = createCeloWallet();
//     expect(w.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
//     expect(w.privateKey).toMatch(/^0x/);
//     // @ts-expect-error mnemonic is not part of the shape
//     expect(w.mnemonic).toBeUndefined();
//   });
//   it('loadCeloWallet recreates the same account from ' +
//     'private key', () => {
//     const w = createCeloWallet();
//     const acc = loadCeloWallet(w.privateKey);
//     expect(acc.address).toBe(w.address);
//   });
//   // Note: The following functions interact with the blockchain
//   // and are not pure units.
//   // Keep them for integration tests only (no mocks requested):
//   // it.skip('getCusdBalance returns the on-chain balance',
//   //   async () => {
//   //   const addr = createCeloWallet().address;
//   //   const bal = await getCusdBalance(addr);
//   //   expect(typeof bal).toBe('string');
//   // });
//   // it.skip('sendCusd broadcasts a transfer and returns a tx hash',
//   //   async () => {
//   //   const sender = createCeloWallet();
//   //   const recipient = createCeloWallet();
//   //   const res = await sendCusd(sender.privateKey,
//   //     recipient.address, '0.01');
//   //   expect(res.txHash).toMatch(/^0x/);
//   // });
// });
