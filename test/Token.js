const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Token', () => {
  let token

  beforeEach(async () => {
    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('Aura Lite', 'ALIT', '10000000')
  })

  describe('Deployment', () => {
    const name = 'Aura Lite'
    const symbol = 'ALIT'
    const decimals = '18'
    const totalSupply = tokens('10000000')

    it('has correct name', async () => {
        expect(await token.name()).to.equal(name)
      })
    
      it('has correct symbol', async () => {
        expect(await token.symbol()).to.equal(symbol)
      })
      
      it('has correct decimals', async () => {
        expect(await token.decimals()).to.equal(decimals)
      })
    
      it('has correct total supply', async () => {
        expect(await token.totalSupply()).to.equal(totalSupply)
      })
  })

})
