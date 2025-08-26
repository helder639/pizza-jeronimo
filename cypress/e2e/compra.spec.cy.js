import userData from '../fixtures/users-data.json'
import LoginPage from '../page/loginPage.js'
import PizzaPage from '../page/pizzaPage.js'

const loginPage = new LoginPage()
const pizzaPage = new PizzaPage()

describe('Realizando compras em cada pagina separadamente', () => {
  beforeEach(() => {
    cy.visit('https://thankful-bay-039b7071e.2.azurestaticapps.net/login.html')
    loginPage.sucessLogin(userData.userSucess.email, userData.userSucess.senha)
  })

  it.skip('Pizza Salgado', () => {
    pizzaPage.compraSalgada()
  })

  it.skip('Pizza Doce', () => {
    pizzaPage.compraDoce()
  })

  it.skip('Bebidas', () => {
    pizzaPage.compraBebidas()
  })
  
  it('Pizza Personalizada', () => {
    pizzaPage.compraPersonalizada()
  })

})