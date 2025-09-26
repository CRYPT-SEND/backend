import { newKit } from '@celo/contractkit';

const CELO_RPC_URL = process.env.CELO_RPC_URL ?? 
  'https://alfajores-forno.celo-testnet.org';
const kit = newKit(CELO_RPC_URL);

async function checkCeloConnection(): Promise<number | null> {
  try {
    const blockNumber = await kit.connection.web3.eth.getBlockNumber();
    // eslint-disable-next-line no-console
    console.log(
      '✅ Connecté à Celo (Alfajores). Numéro de bloc actuel :', 
      blockNumber,
    );
    return blockNumber;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      '❌ Impossible de se connecter à Celo :', 
      (err as Error).message,
    );
    return null;
  }
}

// Appelle cette fonction au démarrage ou dans un endpoint de test
checkCeloConnection();

export { kit, checkCeloConnection };