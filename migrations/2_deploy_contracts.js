var Election = artifacts.require("./USAelections.sol");

module.exports = function (deployer) {
  deployer.deploy(Election);
};
