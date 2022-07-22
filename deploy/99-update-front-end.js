const { frontEndContractsFile, frontEndAbiFile } = require("../helper-hardhat-config")
const fs = require("fs")
const { network, deployments } = require("hardhat") // hardhat includes ethers and expands it's functionality

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        updateAbi()
        updateContractAddresses()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    console.log(frontEndAbiFile)
    // await deployments.fixture(["Raffle"]); // is this needed ?
    const raffle = await deployments.get("Raffle")
    // const raffle = await ethers.getContract("Raffle") // does NOT work if contract get's reused = contract already exisits on the network and does not get deployed again!

    const iface = await new ethers.utils.Interface(raffle.abi)
    console.log(iface.format(ethers.utils.FormatTypes.full))
    fs.writeFileSync(frontEndAbiFile, iface.format(ethers.utils.FormatTypes.json))
    //fs.writeFileSync(frontEndAbiFile, JSON.stringify(raffle.abi))
    // OLD: fs.writeFileSync(frontEndAbiFile, raffle.abi.format(ethers.utils.FormatTypes.json))
}

async function updateContractAddresses() {
    // fs CANNOT read from EMPTY or NOT existing file!
    console.log(frontEndContractsFile)
    const raffle = await deployments.get("Raffle")
    //console.log(raffle.address)
    // const raffle = await ethers.getContract("Raffle") // does NOT work if contract get's reused = contract already exisits on the network and does not get deployed again!
    console.log("TEST! Read? ", fs.readFileSync(frontEndContractsFile, "utf8"))
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    if (network.config.chainId.toString() in contractAddresses) {
        if (!contractAddresses[network.config.chainId.toString()].includes(raffle.address)) {
            contractAddresses[network.config.chainId.toString()].push(raffle.address)
        }
    } else {
        contractAddresses[network.config.chainId.toString()] = [raffle.address]
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend"]
