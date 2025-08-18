import MenuPage from '../page/menuPage.js'
import userData from '../fixtures/users-data.json'
import LoginPage from '../page/loginPage.js'

const loginPage = new LoginPage()
const menuPage = new MenuPage()

describe('Testando Menu Principal', () => {
  beforeEach(()=> {
    cy.visit('https://thankful-bay-039b7071e.2.azurestaticapps.net/login.html')
    loginPage.sucessLogin(userData.userSucess.email, userData.userSucess.senha)
  })

  it('Verificando os elementos do menu principal', () => {
    menuPage.elementsMenu()
  })

  it('Verificando a direção de cada botão do menu principal', () =>{
    menuPage.pagesMenu()
  })
})