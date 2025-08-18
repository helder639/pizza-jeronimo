class MenuPage{

    selectorList(){
        const selectors = {
            titulo: "h1",
            menu: ".header-content",
            allOptions: "a",
        }
        return selectors
    }

    elementsMenu(){
        cy.get(this.selectorList().titulo).contains("🍕 Jerônimu's Pizzaria")
        cy.get(this.selectorList().menu).should('be.visible')
        cy.get(this.selectorList().allOptions).each(($element) =>{  //.each() --> substitui o for
            cy.wrap($element)
                .should('be.visible')
        })
    }

    pagesMenu(){
        const menuLinks = [
            { text: 'Início', href: 'index.html' },
            //{ text: 'Pizzas Salgadas', href: 'menu.html'},
            { text: 'Pizzas Doces', href: 'doces.html'},
            { text: 'Personalizar Pizza', href: 'personalizar.html'},
            { text: 'Bebidas', href: 'bebidas.html'},
            { text: 'Carrinho', href: 'carrinho.html'}
        ]
        menuLinks.forEach((link) => {
        cy.get('a').contains(link.text).click()
        cy.url().should('include', link.href)
        cy.go('back')
        })
    }
}
export default MenuPage