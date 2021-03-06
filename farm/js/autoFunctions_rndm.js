
let rewardPerYear;	

$(document).ready(function() {
	autoContract()
})

async function autoContract() {
	//try{
		const HttpProvider = Web3.providers.HttpProvider;
		const fullNode = new HttpProvider(network);
		const solidityNode = new HttpProvider(network);
		const eventServer = new HttpProvider(network);
		
		let web3 = new Web3(fullNode, solidityNode, eventServer)
			
		for(let i = 0; i < pools.length; i++){
			await (pools[i].contract = new web3.eth.Contract(pools[i].ABI, pools[i].addr))
			await (pools[i].swapContract = new web3.eth.Contract(pools[i].swapABI, pools[i].swapAddr))
		}
			
		await (farmAuto = new web3.eth.Contract(farmABI, farmAddress))
		await (defyAuto = new web3.eth.Contract(defyABI, defy))
		await (rndmAuto = new web3.eth.Contract(defyABI, rndm))
		await (wbnbAuto = new web3.eth.Contract(wbnbABI, wbnb))
		await (busdAuto = new web3.eth.Contract(wbnbABI, busd))
		await (ilpAuto = new web3.eth.Contract(ilpABI, ilp))
		
    
		await (priceFeed = new web3.eth.Contract(priceFeedABI, priceFeedAddress))
		
		await (defyBnbApeAuto = new web3.eth.Contract(apePoolABI, defyBnbApeAddress))
		await (rndmFtmAuto = new web3.eth.Contract(apePoolABI, rndmFtmAddress))
		await (kinsRndmAuto = new web3.eth.Contract(apePoolABI, kinsRndmAddress))
		await (defyBusdApeAuto = new web3.eth.Contract(apePoolABI, defyBusdApeAddress))
		
    
		await (apeContract = new web3.eth.Contract(apeABI, apeAddress))
		
		await getApePrices()
		
		for(let i = 0; i < pools.length; i++){
			await autoBalances(i)
			getLiqTotals(i)
		}
	let totalInt	
        clearInterval(totalInt)

    
	//	getSupply()
		setInterval(() => {
			refreshStats()
		}, 1000 * 8)
	/*
	}catch(e){
		console.log(e)
		setTimeout(() => {
			autoContract()
		}, 750)
	}
	*/
}
function refreshStats(){
//	getSupply()
	getApePrices()
	for(i = 0; i < pools.length; i++){
		autoBalances(i)
		getLiqTotals(i)
	}
}	
/*
async function getSupply(){
//	let totalSupply = parseInt(await (defyAuto.methods.totalSupply().call()) / 1e18)
//	$('.total-supply')[0].innerHTML = '' +totalSupply.toFixed()
		
//	let totalBurn = await (defyAuto.methods.totalBurn().call() / 1e18)
//	$('.total-burned')[0].innerHTML = '' +totalBurn.toFixed()

	//let ilpBalance = await defyAuto.methods.balanceOf(ilp).call() / 1e18
	//$('.ilp-defy-balance')[0].innerHTML = '' +ilpBalance
    
    let Ttvl 
    for(let i = 0; i < pools.length; i++){
			await autoBalances(i)
			getLiqTotals(i)
		}
}*/


//let currentDefyToBusd

let currentBnbPriceToUsd

let walletInt

let currentApeBnbToDefy
let currentApeDefyToBnb

let currentApeBusdToDefy = 0
let currentFtmToRndm = 0

async function getApePrices(){
	let resDefyBnb = await defyBnbApeAuto.methods.getReserves().call()	
	let resDefyBusd = await defyBusdApeAuto.methods.getReserves().call()
	let resRndmFtm = await rndmFtmAuto.methods.getReserves().call()
	let roundData = await priceFeed.methods.latestRoundData().call()
	currentBnbPriceToUsd = roundData.answer / 1e8
	
	currentApeBnbToDefy = await apeContract.methods.quote(toHexString(1e18), resDefyBnb._reserve1, resDefyBnb._reserve0).call() / 1e18
	currentApeDefyToBnb = await apeContract.methods.quote(toHexString(1e18), resDefyBusd._reserve0, resDefyBusd._reserve1).call() / 1e18
/* 	console.log(currentApeBnbToDefy)
	console.log(currentApeDefyToBnb) */
	
   
    currentFtmToRndm = await apeContract.methods.quote(toHexString(1e18), resRndmFtm._reserve1, resRndmFtm._reserve0).call() / 1e18
     
//	$('.defy-bnb-price')[0].innerHTML = '1 BNB = ~'+currentApeBnbToDefy.toFixed(2)+' DEFY'
//	$('.kins-price')[0].innerHTML = '$'+currentApeBusdToDefy.toFixed(2)
	
/*	walletInt = setInterval(() => {
		$('.wallet-balance')[0].innerHTML = (currentApeBusdToDefy * user.defy)+'$'
	}, 1000) */
}
async function autoBalances(pid){
	let contract = pools[pid].contract

	let swapContract = pools[pid].swapContract

	rewardPerYear = parseInt(await farmAuto.methods.rewardPerBlock().call()) * 60 * 60 * 24 * 365 / 1e18
	
	pools[pid].lpInFarm = parseInt(await contract.methods.balanceOf(farmAddress).call()) / 1e18
	
	let resLpToken = await contract.methods.getReserves().call()
	let currentLpTokenPrice = await swapContract.methods.quote(toHexString(1e18), resLpToken._reserve1, resLpToken._reserve0).call() / 1e18
		
	pools[pid].totalSupply = parseInt(await contract.methods.totalSupply().call()) / 1e18
    
        
    

	if(pid >= 0){
		pools[pid].defyBal = parseInt(await defyAuto.methods.balanceOf(pools[pid].addr).call()) / 1e18
		$('.pool-apy-'+pid)[0].innerHTML = '' + (rewardPerYear / ( 1000/1000 * (pools[pid].lpInFarm / pools[pid].totalSupply) * pools[pid].defyBal) * 100).toFixed(2) + '%'
	}

}
function getLiqTotals(pid){

	if(pid == 10)
		getKinsRndmLiq(pid)

}


async function getKinsRndmLiq(pid){
	let token0Pool = await defyAuto.methods.balanceOf(pools[pid].addr).call() / pools[pid].token0Dec
	let token1Pool = await rndmAuto.methods.balanceOf(pools[pid].addr).call() / pools[pid].token1Dec
			
	pools[pid].lpTokenValueTotal = (currentBnbPriceToUsd * currentFtmToRndm * token1Pool) + (token0Pool * currentApeBusdToDefy)

	let totalLiqInFarm = pools[pid].lpTokenValueTotal * (pools[pid].lpInFarm*1e18) / (pools[pid].totalSupply*1e18)
	
	$('.pool-liq-'+pid)[0].innerHTML = "" + totalLiqInFarm.toFixed(2)+'$'
	$('.total-pool-liq-'+pid)[0].innerHTML = "" + pools[pid].lpTokenValueTotal.toFixed(2)+'$'
}
