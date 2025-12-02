import { createComplianceClient, CompliancePacketAPIError } from './client';

async function main() {
  const apiKey = 'cpk_7b5c5cb7c4f54c81bafbdc217f9a318d';
  const client = createComplianceClient({
    apiKey,
    // baseUrl: 'http://localhost:4000', // optional override
  });

  try {
    const packet = await client.check('hello from the JS SDK');
    console.log('Packet:', JSON.stringify(packet, null, 2));

    const usage = await client.usage();
    console.log('Usage:', JSON.stringify(usage, null, 2));
  } catch (err) {
    if (err instanceof CompliancePacketAPIError) {
      console.error('API error from Compliance Packet:', {
        code: err.code,
        status: err.status,
        details: err.details,
        message: err.message,
      });
    } else {
      console.error('Unexpected error:', err);
    }
  }
}

main();