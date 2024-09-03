const hre = require("hardhat");

async function main() {
  const CoffeeInc = await hre.ethers.getContractFactory("Coffee_Inc");
  const coffeeInc = await CoffeeInc.deploy(100000000, 50);

  await coffeeInc.waitForDeployment();

  console.log("Coffee_Inc deployed to:", await coffeeInc.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
