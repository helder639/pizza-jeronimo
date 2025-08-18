class LoginPage{

    selectorList(){
        const selectors = {
            emailField: "[type='email']",
            passwordField: "[type='password']",
            loginButton: "[type='submit']",
            menuPrincipal: ".header-content",
            mensagemErro: ".error-message",
            menuLogin: ".login-container"
        }
        return selectors
    }

    sucessLogin(email, senha){
        cy.get(this.selectorList().emailField).type(email)
        cy.get(this.selectorList().passwordField).type(senha)
        cy.get(this.selectorList().loginButton).click()
        cy.get(this.selectorList().menuPrincipal).should('be.visible')
    }

    failLogin(email,senha){
        cy.get(this.selectorList().emailField).type(email)
        cy.get(this.selectorList().passwordField).type(senha)
        cy.get(this.selectorList().loginButton).click()
        cy.get(this.selectorList().mensagemErro).should('be.visible')
    }
    
    nullLogin(){
        cy.get(this.selectorList().loginButton).click()
        cy.get(this.selectorList().menuLogin).should('be.visible')
    }
}
export default LoginPage