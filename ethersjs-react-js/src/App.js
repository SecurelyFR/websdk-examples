import React, { useState } from 'react';
import { connectWallet } from './utils/contractHelper';
import { ethers } from 'ethers';
import { validateEthTransferCompliance } from "@securely.id/websdk"

const App = () => {
    const [walletAddress, setWalletAddress] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [ethAmount, setEthAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConnectWallet = async () => {
        try {
            const { signer } = await connectWallet();
            const address = await signer.getAddress();
            setWalletAddress(address);
            alert(`Connected: ${address}`);
        } catch (error) {
            console.error(error);
            alert("Failed to connect wallet.");
        }
    };

    const handleSendEther = async () => {
        if (!recipientAddress || !ethAmount) {
            alert("Please enter recipient address and amount.");
            return;
        }

        try {
            setLoading(true);
            const { signer, contract } = await connectWallet();
            const amountInWei = ethers.parseEther(ethAmount);

            const args = [recipientAddress, { value: amountInWei }];

            await validateEthTransferCompliance(
              (await signer.provider.getNetwork()).chainId.toString(),
              await contract.getAddress(),
              contract.interface.getFunction('payEthers', args).selector,
              signer.address,
              recipientAddress,
              Number(amountInWei)
            );

            const tx = await contract.payEthers(...args);

            await tx.wait();
            alert(`Sent ${ethAmount} ETH to ${recipientAddress}`);
        } catch (error) {
            console.error(error);
            alert("Failed to send Ether.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Send Ether with React, TypeScript, and Ethers.js</h1>
            <button onClick={handleConnectWallet}>
                {walletAddress ? `Connected: ${walletAddress}` : 'Connect Wallet'}
            </button>

            <div>
                <input
                    type="text"
                    placeholder="Recipient Address"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Amount in ETH"
                    value={ethAmount}
                    onChange={(e) => setEthAmount(e.target.value)}
                />
                <button onClick={handleSendEther} disabled={loading}>
                    {loading ? 'Sending...' : 'Send Ether'}
                </button>
            </div>
        </div>
    );
};

export default App;
