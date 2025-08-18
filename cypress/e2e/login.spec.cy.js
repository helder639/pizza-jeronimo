import userData from '../fixtures/users-data.json'
import LoginPage from '../page/loginPage.js'

const loginPage = new LoginPage()


describe('Teste de Sucesso no Login', () => {

  beforeEach(()=> {
    cy.visit('https://thankful-bay-039b7071e.2.azurestaticapps.net/login.html')
  })

  it('Login efetuado', () => {
    loginPage.sucessLogin(userData.userSucess.email, userData.userSucess.senha)
  })
})

describe('Teste de Erro no Login', () => {

  beforeEach(()=> {
    cy.visit('https://thankful-bay-039b7071e.2.azurestaticapps.net/login.html')
  })

  it('Login não efetuado - Senha errada', () => {
    loginPage.failLogin(userData.userFail_1.email, userData.userFail_1.senha)
  })
  
  it('Login não efetuado - Email errado', () => {
    loginPage.failLogin(userData.userFail_2.email, userData.userFail_2.senha)
  })

  it('Login não efetuado - Email e Senha errados', () => {
    loginPage.failLogin(userData.userFail_3.email, userData.userFail_3.senha)
  })

  it('Login não efetuado - Vazio', () => {
    loginPage.nullLogin()
  })

})