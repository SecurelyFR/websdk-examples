import { ethers } from "ethers";

const abi = [
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
];

const contractAddress = '0x768ad0C476923cbb918cb3442A58780494741074';

export const connectWallet = async () => {
    if (!window.ethereum) {
        throw new Error("Metamask not installed");
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    return { signer, contract };
};
