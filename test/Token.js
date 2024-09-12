const { expect } = require('chai');
const { recoverAddress } = require('ethers/lib/utils');
const { ethers } = require('hardhat');
const { transform } = require('lodash');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Token\n', () => {
  let token, accounts, deployer, exchange

  beforeEach(async () => {
    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('Aura Lite', 'ALIT', '10000000')

    accounts = await ethers.getSigners()
    deployer = accounts[0]
    receiver = accounts[1]
    exchange = accounts[2]
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

    it('assigns total supply to deployer\n', async () => {
      expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
    })

  })

  describe('Sending Tokens\n', () => {
    let amount, transaction, result

    describe('Success', () => {
        
        beforeEach(async () => {
            amount = tokens(100)
            transaction = await token.connect(deployer).transfer(receiver.address, amount)
            result = await transaction.wait()
        })
        
        it('transfers token balances', async () => {
          expect(await token.balanceOf(deployer.address)).to.equal(tokens(9999900))
          expect(await token.balanceOf(receiver.address)).to.equal(amount)
        })
    
        it('emits a transfer event\n', async () => {
          const event = result.events[0]
          expect(event.event).to.equal('Transfer')
    
          const args = event.args
          expect(args.from).to.equal(deployer.address)
          expect(args.to).to.equal(receiver.address)
          expect(args.value).to.equal(amount)
        })
    })

    describe('Failure', async () => {
        it('rejects insufficient balances', async () => {
          const invalidAmount = tokens(100000000)
          await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
        })

        it('rejects invalid recipients\n', async () => {
          const amount = tokens(100)
          await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
        })
    })

  })

  describe('Approving Tokens\n', () => {
    let amount, trasnaction, result

    beforeEach(async () => {
        amount = tokens(100)
        transaction = await token.connect(deployer).approve(exchange.address, amount)
        result = await transaction.wait()
    })

    describe('Success', () => {
        it('allocates an allowance for token spending', async () => {
          expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
        })

        it('emits an approval event\n', async () => {
          const event = result.events[0]
          expect(event.event).to.equal('Approval')
      
          const args = event.args
          expect(args.owner).to.equal(deployer.address)
          expect(args.spender).to.equal(exchange.address)
          expect(args.value).to.equal(amount)
        })

    })

    describe('Failure', () => {
        it('rejects invalid spenders\n', async () => {
          await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
        })
    })

  })

  describe('Delegating Token Transfers\n', () => {
    let amount, transaction, result

    beforeEach(async () => {
      amount = tokens(100)
      transaction = await token.connect(deployer).approve(exchange.address, amount)
      result = await transaction.wait()
    })

    describe('Success', () => {

      beforeEach(async () => {
        transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount)
        result = await transaction.wait()
      })

      it('transfers token balances', async () => {
        expect(await token.balanceOf(deployer.address)).to.be.equal(ethers.utils.parseUnits("9999900", "ether"))
        expect(await token.balanceOf(receiver.address)).to.be.equal(amount)
      })

      it('rests the allowance', async () => {
        expect(await token.allowance(deployer.address, exchange.address)).to.be.equal(0)
      })

      it('emits a transfer event\n', async () => {
        const event = result.events[0]
        expect(event.event).to.equal('Transfer')

        const args = event.args
        expect(args.from).to.equal(deployer.address)
        expect(args.to).to.equal(receiver.address)
        expect(args.value).to.equal(amount)
      })

    })

    describe('Failure', async () => {
      it('rejects insufficient amounts\n', async () => {
        const invalidAmount = tokens(100000000)
        await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.reverted
      })

    })

  })

})
