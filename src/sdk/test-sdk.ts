// test-sdk.ts
import { createComplianceClient } from './client';

async function main() {
  const client = createComplianceClient({
    apiKey: 'cpk_7b5c5cb7c4f54c81bafbdc217f9a318d',
    baseUrl: 'http://localhost:4000', // optional if that's the default
  });

  const packet = await client.check('This is a harmless test message.');
  console.log('Packet:', JSON.stringify(packet, null, 2));

  const usage = await client.usage();
  console.log('Usage:', JSON.stringify(usage, null, 2));
}

main().catch((err) => {
  console.error(err);
});