const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => {
  let name = 'Star power 103!'
  let starStory = "I love my wonderful star"
  let user1 = accounts[1];
  let user2 = accounts[2]
  let ra = "ra_032.155"
  let dec = "dec_121.874"
  let mag = "mag_245.978"
  const tokenId = 1
  let starPrice = web3.utils.toWei('0.1', "ether")

    beforeEach(async function() {
        this.contract = await StarNotary.new({from: accounts[0]})
    })

    // createStar test
    describe('can create a star', () => {
        it('create a star and get data', async function () {
            await this.contract.createStar(name, starStory, ra, dec, mag, {from: user1});
            let askedStar = await this.contract.tokenIdToStarInfos(tokenId);

            askedName = askedStar[0].toString()
            askedStory = askedStar[1].toString()
            askedRa = askedStar[2].toString()
            askedDec = askedStar[3].toString()
            askedMag = askedStar[4].toString()

            assert.equal(askedName, name)
            assert.equal(askedStory, starStory)
            assert.equal(askedRa, ra)
            assert.equal(askedDec, dec)
            assert.equal(askedMag, mag)
        })
    })


    describe('buyStar test', () => {
        it('Account 2 bought the star and is now the owner', async function() {
            await this.contract.createStar(name, starStory, ra, dec, mag, {from: user1})
            await this.contract.putStarUpForSale(tokenId, starPrice, {from: user1})
            assert.equal(await this.contract.starsForSale(tokenId), starPrice)

            await this.contract.buyStar(tokenId, {from: user2, value: starPrice, gasPrice: 0})
            assert.equal(await this.contract.ownerOf(tokenId), user2)
        })
    })

    describe('check if star exists', () => {
        it('star already exists', async function () {
            await this.contract.createStar(name, starStory, ra, dec, mag, {from: accounts[0]})

            assert.equal(await this.contract.checkIfStarExist(ra, dec, mag), true)
        })
    })

    describe('test ownerOf', () => {
        it('star has the rightful owner', async function () {
            await this.contract.createStar(name, starStory, ra, dec, mag, {from: accounts[0]})
            const owner = await this.contract.ownerOf(1, {from: accounts[0]})

            assert.equal(owner, accounts[0])
        })
    })

    describe('mint test', () => {
        let tx
        beforeEach(async function() {
            tx = await this.contract.mint(tokenId, {from: accounts[0]})
        })
        it('minted token belong to the right owner', async function () {
            var owner = await this.contract.ownerOf(tokenId, {from: accounts[0]})
            assert.equal(owner, accounts[0])
        })
    })

    describe('approve test', () =>{
        let to = accounts[1]
        let tokenId = 1
        it('getApproved test', async function() {
            await this.contract.createStar(name, starStory, ra, dec, mag, {from: accounts[0]})
            tx = await this.contract.approve(to, tokenId, {from: accounts[0]})

            assert.equal(await this.contract.getApproved(tokenId, {from: accounts[0]}), to)
        })
    })

    describe('setApprovalForAll test', () => {
        let approved = true
        let to = accounts[1]
        it('isApprovedForAll test', async function() {
            await this.contract.createStar(name, starStory, ra, dec, mag, {from: accounts[0]})
            await this.contract.setApprovalForAll(to, tokenId)

            assert.equal(await this.contract.isApprovedForAll(accounts[0], to, {from: accounts[0]}), approved)
        })
    })

    describe('transfer from test', () => {
        let to = accounts[1]
        beforeEach(async function() {
            await this.contract.createStar(name, starStory, ra, dec, mag, {from: accounts[0]})
            await this.contract.safeTransferFrom(accounts[0], to, tokenId)
        })
        it('is the owner of the token', async function() {
            assert.equal(await this.contract.ownerOf(tokenId, {from: accounts[0]}), to)
        })
        it('is not the owner of the token', async function() {
            assert.notEqual(await this.contract.ownerOf(tokenId, {from: accounts[0]}), accounts[0])
        })
    })
})
