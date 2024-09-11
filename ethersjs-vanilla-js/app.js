const securelyAddress = '0xB13807B66c0c03CbeBaBc8363e133216db0D33C0';
const compliantTreasuryAddress = '0x768ad0C476923cbb918cb3442A58780494741074';
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
];

let provider;
let signer;
let compliantTreasury;

document.getElementById('connectWallet').onclick = async function () {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            compliantTreasury = new ethers.Contract(compliantTreasuryAddress, compliantTreasuryAbi, signer);
            $('#sendEther').show();
            $('#connectWallet').hide();
        } catch (error) {
            console.error("Error while connecting the wallet:", error);
        }
    } else {
        alert('Install Metamask!');
    }
};

document.getElementById('sendEther').onclick = async function () {
    try {
        const amountInWei = BigInt(ethers.parseEther("0.0001"));
        const chainId = (await provider.getNetwork()).chainId;
        const functionName = 'payEthers';
        const args = [securelyAddress, { value: amountInWei }];
        const selector = compliantTreasury.interface.getFunction('payEthers', args).selector;
        await validateEthTransferCompliance(
            chainId.toString(),
            compliantTreasuryAddress,
            selector,
            signer.address,
            securelyAddress,
            Number(amountInWei)
        );
        await compliantTreasury.getFunction(functionName)(...args);

        alert(`Sent some ETH to ${securelyAddress}`);
    } catch (error) {
        console.error("Error while sending ethers", error);
    }
};
