const wait = timeout => new Promise(resolve => setTimeout(resolve, timeout))

contract('SpankBank', (accounts) => {
  before('before 1.0', async () => {
    await wait(1)
    console.log('before 1.0')
  })

  beforeEach('beforeEach', async () => {
    await wait(1)
    console.log('beforeEach 1.0')
  })

  describe('test suite 1', () => {
    it('test 1.1', async () => {
      await wait(1)
      console.log('test 1.1')
    })

    it('test 1.2', async () => {
      await wait(1)
      console.log('test 1.2')
    })
  })

  describe('test suite 2', () => {
    it('test 2.1', async () => {
      await wait(1)
      console.log('test 2.1')
    })

    it('test 2.2', async () => {
      await wait(1)
      console.log('test 2.2')
    })

    describe('nested test suite 2.3', () => {

      // what happens if more before / beforeEach?

      before('before 2.3', async () => {
        await wait(1)
        console.log('before 2.3')
      })

      beforeEach('beforeEach 2.3', async () => {
        await wait(1)
        console.log('beforeEach 2.3')
      })

      it('test 2.3.1', async () => {
        await wait(1)
        console.log('test 2.3.1')
      })

      it('test 2.3.2', async () => {
        await wait(1)
        console.log('test 2.3.2')
      })

    })
  })
})

