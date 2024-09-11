<template>
  <div>
    <h1>Send Ether with Vue.js, TypeScript, and Ethers.js</h1>
    <button @click="handleConnectWallet">
      {{ walletAddress ? `Connected: ${walletAddress}` : 'Connect Wallet' }}
    </button>

    <div>
      <input
        type="text"
        v-model="recipientAddress"
        placeholder="Recipient Address"
      />
      <input
        type="text"
        v-model="ethAmount"
        placeholder="Amount in ETH"
      />
      <button @click="handleSendEther" :disabled="loading">
        {{ loading ? 'Sending...' : 'Send Ether' }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { connectWallet } from "../utils/contractHelper";
import { ethers } from "ethers";
import { validateEthTransferCompliance } from "@securely.id/websdk";

export default defineComponent({
  name: "HelloWorld",
  setup() {
    const walletAddress = ref<string | null>(null);
    const recipientAddress = ref<string>("");
    const ethAmount = ref<string>("");
    const loading = ref<boolean>(false);

    const handleConnectWallet = async () => {
      try {
        const { signer } = await connectWallet();
        const address = await signer.getAddress();
        walletAddress.value = address;
        alert(`Connected: ${address}`);
      } catch (error) {
        console.error(error);
        alert("Failed to connect wallet.");
      }
    };

    const handleSendEther = async () => {
      if (!recipientAddress.value || !ethAmount.value) {
        alert("Please enter recipient address and amount.");
        return;
      }

      try {
        loading.value = true;
        const { signer, contract } = await connectWallet();
        const amountInWei = ethers.parseEther(ethAmount.value);
        const args = [recipientAddress.value, { value: amountInWei }];

        await validateEthTransferCompliance(
              (await signer.provider.getNetwork()).chainId.toString(),
              await contract.getAddress(),
              contract.interface.getFunction('payEthers', args)!.selector,
              signer.address,
              recipientAddress.value,
              Number(BigInt(amountInWei))
            );
        await validateEthTransferCompliance(
          chainId,
          yourDappAddress,
          'yourDappFunctionSignature(bytes32,uint256)',
          signerAddress,
          valueInWei // BigInt('0') if the call is not payable
        )

        const tx = await contract.payEthers(...args);

        await tx.wait();
        alert(`Sent ${ethAmount.value} ETH to ${recipientAddress.value}`);
      } catch (error) {
        console.error(error);
        alert("Failed to send Ether.");
      } finally {
        loading.value = false;
      }
    };

    return {
      walletAddress,
      recipientAddress,
      ethAmount,
      loading,
      handleConnectWallet,
      handleSendEther,
    };
  },
});
</script>
