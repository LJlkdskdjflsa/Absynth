import axios from "axios";

export async function retrieveAttestation(domain: string, transactionHash: string) {
    console.log('Retrieving attestation...')
    // txhash of burning usdc with circle specified domain id
    const url = `https://iris-api-sandbox.circle.com/v2/messages/${domain}?transactionHash=${transactionHash}`;
    console.log(url);
    while (true) {
        try {
            const response = await axios.get(url)
            if (response.status === 404) {
                console.log('Waiting for attestation...')
            }
            if (response.data?.messages?.[0]?.status === 'complete') {
                console.log('Attestation retrieved successfully!')
                return response.data.messages[0]
            }
            console.log('Waiting for attestation...')
            await new Promise((resolve) => setTimeout(resolve, 5000))
        } catch (error: unknown) {
            console.error('Error fetching attestation:', error instanceof Error ? error.message : String(error))
            await new Promise((resolve) => setTimeout(resolve, 5000))
        }
    }
}