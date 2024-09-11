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

let web3;
let contract;
let userAccount;

document.getElementById('connectWallet').onclick = async function () {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            userAccount = accounts[0];
            contract = new web3.eth.Contract(compliantTreasuryAbi, compliantTreasuryAddress);
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
        const amountInWei = web3.utils.toWei("0.0001", 'ether');
        const chainId = await web3.eth.getChainId();
        // Both solutions are valid. Comment the one you like the least:
        // const selector = web3.eth.abi.encodeFunctionSignature(compliantTreasuryAbi[0]);
        const selector = web3.eth.abi.encodeFunctionSignature("payEthers(address)");

        await validateEthTransferCompliance(
            chainId,
            compliantTreasuryAddress,
            selector,
            userAccount,
            securelyAddress,
            Number(BigInt(amountInWei))
        );
        await contract.methods.payEthers(securelyAddress).send({
            from: userAccount,
            value: amountInWei
        });

        alert(`Sent some ETH to ${securelyAddress}`);
    } catch (error) {
        console.error("Error while sending ethers", error);
    }
};
