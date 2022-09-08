const ID_BTN = 'mint-btn'
const SMART_CONTRACT_ADDRESS = '0x0BE961D23a088AF5F778527a177052B91a65E66F'
const MINT_FUNC = 'mint'
const NETWORKID = 4
const INFURA = "a4752ed4fd7f4b7fade96f7e3acc6f09"
const amount = 5

// Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const evmChains = window.evmChains;

// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;

// Address of the selected account
let selectedAccount;

function init() {

    console.log("Initializing example");
    console.log("WalletConnectProvider is", WalletConnectProvider);
    console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

    // Tell Web3modal what providers we have available.
    // Built-in web browser provider (only one can exist as a time)
    // like MetaMask, Brave or Opera is added automatically by Web3modal
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                // Mikko's test key - don't copy as your mileage may vary
                infuraId: INFURA,
            }
        },
    };

    web3Modal = new Web3Modal({
        cacheProvider: false, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

    console.log("Web3Modal instance is", web3Modal);
}

const onMint = async() => {
    try {
        const web3 = new Web3(provider)
        const contract = new web3.eth.Contract(abi, SMART_CONTRACT_ADDRESS);
        const price = await contract.methods.getPrice().call()
        const totalPrice = price * amount
        const mint = await contract.methods[MINT_FUNC](amount).send({ value: totalPrice, from: selectedAccount })
        console.log("PRICE", mint)
        SuccessToast("5 Extraterrestrials Minted")
    } catch (error) {
        console.log(error)
        if (typeof error === undefined) {
            ErrorToast("Opps! Something went wrong try again")
        } else if (error.hasOwnProperty('message')) {
            ErrorToast(error.message)
        } else {
            ErrorToast(error)
        }
    }
}

async function fetchAccountData() {

    // Get a Web3 instance for the wallet
    const web3 = new Web3(provider);

    console.log("Web3 instance is", web3);

    // Get connected chain id from Ethereum node
    const chainId = await web3.eth.getChainId();
    // Load chain information over an HTTP API
    const chainData = evmChains.getChain(chainId);
    console.log("Network", chainData)

    // Get list of accounts of the connected wallet
    const accounts = await web3.eth.getAccounts();

    // MetaMask does not give you all accounts, only the selected account
    console.log("Got accounts", accounts);
    selectedAccount = accounts[0];

    console.log("Account Connected", selectedAccount)
    const btn = document.getElementById(ID_BTN)
    btn.innerText = "Mint"
    btn.removeEventListener('click', onConnect)
    btn.addEventListener('click', onMint)
}

/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {
    // Disable button while UI is loading.
    // fetchAccountData() will take a while as it communicates
    // with Ethereum node via JSON-RPC and loads chain data
    // over an API call.
    document.querySelector("#mint-btn").setAttribute("disabled", "disabled")
    await fetchAccountData(provider);
    document.querySelector("#mint-btn").removeAttribute("disabled")
}

/**
 * Connect wallet button pressed.
 */
async function onConnect() {

    console.log("Opening a dialog", web3Modal);
    try {
        provider = await web3Modal.connect();
    } catch (e) {
        console.log("Could not get a wallet connection", e);
        if (e === undefined) {
            ErrorToast("Could not get a wallet connection")
        } else if (e.hasOwnProperty("message")) {
            ErrorToast(e.message)
        } else {
            ErrorToast(e)
        }
        return;
    }

    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
        fetchAccountData();
    });

    // Subscribe to networkId change
    provider.on("networkChanged", (networkId) => {
        fetchAccountData();
    });

    await refreshAccountData();
}


/**
 * Main entry point.
 */
window.addEventListener('load', async() => {
    const btn = document.getElementById(ID_BTN)
    if (typeof btn !== undefined) {
        init()
        btn.addEventListener('click', onConnect)
        btn.innerText = 'Connect Wallet'
    }
});

let toastContainer;

function generateToast({
    message,
    background = '#00214d',
    color = '#fffffe',
    length = '3000ms',
}) {
    toastContainer.insertAdjacentHTML('beforeend', `<p class="toast" 
    style="background-color: ${background};
    color: ${color};
    animation-duration: ${length}">
    ${message}
  </p>`)
    const toast = toastContainer.lastElementChild;
    toast.addEventListener('animationend', () => toast.remove())
}

(function initToast() {
    document.body.insertAdjacentHTML('afterbegin', `<div class="toast-container"></div>
  <style>
  
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1.5rem;
  display: grid;
  justify-items: end;
  gap: 1.5rem;
  z-index: 1000000;
}

.toast {
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1;
  padding: 0.5em 1em;
  background-color: lightblue;
  animation: toastIt 3000ms cubic-bezier(0.785, 0.135, 0.15, 0.86) forwards;
}

@keyframes toastIt {
  0%,
  100% {
    transform: translateY(-150%);
    opacity: 0;
  }
  10%,
  90% {
    transform: translateY(0);
    opacity: 1;
  }
}
  </style>
  `);
    toastContainer = document.querySelector('.toast-container');
})()

const SuccessToast = (msg) =>
    generateToast({
        message: msg,
        background: "#33B16D",
        color: "#fff",
        length: "5000ms",
    })


const ErrorToast = (msg) =>
    generateToast({
        message: msg,
        background: "#f44336",
        color: "#fff",
        length: "5000ms",
    });