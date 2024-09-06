import * as React from 'react'
import { encodeFunctionData, parseEther } from 'viem'
import { type BaseError, useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { validateEthTransferCompliance } from '@securely.id/websdk'

const securelyAddress = '0xB13807B66c0c03CbeBaBc8363e133216db0D33C0'
const compliantTreasuryAddress = '0x768ad0C476923cbb918cb3442A58780494741074'
const compliantTreasuryAbi = [
    {
        "inputs": [
            {
                "internalType": "address payable",
                "name": "destination",
                "type": "address"
            }
        ],
        "name": "payEthers",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
] as const

export function PayEthersButton() {
    const { data: hash, error, isPending, writeContract } = useWriteContract()
    const account = useAccount()
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

    async function payEthers(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (account.status !== 'connected')
            return
        const txData = {
            address: compliantTreasuryAddress,
            abi: compliantTreasuryAbi,
            functionName: 'payEthers',
            args: [securelyAddress],
            value: parseEther('0.0001'),
        } as const
        await validateEthTransferCompliance(
            account.chainId.toString(),
            txData.address,
            encodeFunctionData(txData).slice(0, 10),
            account.addresses[0],
            securelyAddress,
            Number(txData.value)
        )
        writeContract(txData)
    }

    return (
        <form onSubmit={payEthers}>
            <button disabled={isPending} type="submit">
                Pay Ethers
                {isPending ? '...' : ''}
            </button>
            {hash && <div>Transaction Hash: {hash}</div>}
            {isConfirming && <div>Waiting for confirmation...</div>} 
            {isConfirmed && <div>Transaction confirmed.</div>} 
            {error && (
                <div>Error: {(error as BaseError).shortMessage || error.message}</div>
            )}
        </form>
    )
}
