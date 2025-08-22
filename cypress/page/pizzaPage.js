class PizzaPage{

    selectorList(){
        const selectors = {
            pizzaSalgada: "[href='menu.html']",
            pizzaDoce: "[href='doces.html']",
            bebidas: "[href='bebidas.html']",
            personalizada: "[href='personalizar.html']",
            carrinho: "[href='carrinho.html']",
            buttonAdd: "[onclick='mostrarTamanhos(this)']",
            item: ".menu-item",
            bordas: ".borda-recheada",
            quantMais: "[onclick='alterarQuantidade(this, 1)']",
            quantMenos: "[onclick='alterarQuantidade(this, -1)']",
            quant: ".quantidade-pizza[type='number']",
            buttonGrande: "[data-original-text='Grande']",
            buttonMedia: "[data-original-text='Média']",
            carrinho: "[href='carrinho.html']",
            precoIndividual: "[data-label='Total']",
            precoTotal: "strong", //eq(1)
            observacao: "[placeholder='Ex: Tirar cebola da pizza, entregar sem contato, etc.']",
            finalizar: "[onclick='finalizarPedido()']",
            rua: "[placeholder='Ex: Rua das Flores, Av. Brasil']",
            numero: "[placeholder='123']",
            bairro: "[placeholder='Ex: Centro, Vila Nova']",
            complemento: "[placeholder='Ex: Apartamento 201, Casa dos fundos']",
            cep: "[placeholder='86270-000']",
            referencia: "[placeholder='Ex: Próximo ao mercado, em frente à igreja']",
            tipoEntrega: "[onchange='atualizarTaxaEntrega()']",
            pagamento: "[onchange='mostrarCampoTroco()']",
            enviarPedido: "[onclick='confirmarPedidoComEndereco()']",
            precoFinal: "#total-final-modal",
            mudar600ml: "[onclick='mudarCarrossel600ml(1)']",
            addRefri600ml: "[onclick='adicionarRefri600ml(this)']",
            addVinhoBranco: "[onclick='adicionarCarrinho('Vinho Branco', 'Garrafa 750ml', 35.00, this)']",
            troco: "[placeholder='Ex: 50']",
            allButtons: "button",
        }
        return selectors
    }

    compraSalgada(){
        cy.get(this.selectorList().buttonAdd).eq(2).click()
        cy.get(this.selectorList().buttonGrande).eq(2).click()
        cy.get(this.selectorList().quant).eq(2).should('have.value', '1')
        cy.get(this.selectorList().item).eq(10).then(($option) => {

            cy.wrap($option).scrollIntoView();

        })
        cy.get(this.selectorList().bordas).eq(10).select('Cheddar')
        cy.get(this.selectorList().bordas).eq(10).should('have.value', 'Cheddar')
        cy.get(this.selectorList().quantMais).eq(10).click()
        cy.get(this.selectorList().quantMenos).eq(10).click()
        cy.get(this.selectorList().quant).eq(10).should('have.value', '1')
        cy.get(this.selectorList().buttonAdd).eq(10).click()
        cy.get(this.selectorList().buttonMedia).eq(10).click()
        cy.get(this.selectorList().item).eq(13).then(($option) => {

            cy.wrap($option).scrollIntoView()

        })
        cy.get(this.selectorList().bordas).eq(13).select(1)
        cy.get(this.selectorList().bordas).eq(13).should('have.value', 'Catupiry')
        cy.get(this.selectorList().quantMais).eq(13).click()
        cy.get(this.selectorList().quant).eq(13).should('have.value', '2')
        cy.get(this.selectorList().buttonAdd).eq(13).click()
        cy.get(this.selectorList().buttonMedia).eq(13).click()

        cy.get(this.selectorList().carrinho).click()
        cy.get(this.selectorList().precoIndividual).eq(0).should('have.text', 'R$ 52,90').and('be.visible')//para elementos <td> usar have.text
        cy.get(this.selectorList().precoIndividual).eq(1).should('have.text', 'R$ 63,80').and('be.visible')
        cy.get(this.selectorList().precoIndividual).eq(2).should('have.text', 'R$ 131,60').and('be.visible')
        cy.get(this.selectorList().precoTotal).eq(1).should('have.text', 'R$ 248,30').and('be.visible')
        cy.get(this.selectorList().observacao).type('Capricha nessas pizzas ai em rapá.')
        cy.get(this.selectorList().finalizar).click()
        cy.get(this.selectorList().rua).type('Av. Rua Estrada')
        cy.get(this.selectorList().numero).type('0')
        cy.get(this.selectorList().bairro).type('Rodovia')
        cy.get(this.selectorList().complemento).type('É a com asfalto')
        cy.get(this.selectorList().cep).type('86300-188')
        cy.get(this.selectorList().referencia).type('É um cadinho pra direita e outro pra esquerda')  
        cy.get(this.selectorList().tipoEntrega).select('🚚 Entrega (+R$ 3,00)')
        cy.get(this.selectorList().pagamento).select('📱 PIX')
        cy.get(this.selectorList().precoFinal).should('have.text', 'R$ 251,30')
        cy.get(this.selectorList().enviarPedido).click()
        // Apos confirmar o envio o cypress tenta abrir o whatsApp porém nele nada é mostrado, mas o pdf do pedido é baixo. 
        //cy.readFile('cypress/downloads/pedido-pizzaria.pdf').should('exist')
        //O pdf esta na pasta download
    }

    compraDoce(){
        cy.get(this.selectorList().pizzaDoce).click()
        cy.get(this.selectorList().item).eq(8).then(($option) => {

            cy.wrap($option).scrollIntoView();

        })
        cy.get(this.selectorList().bordas).eq(8).select('Chocolate Branco')
        cy.get(this.selectorList().bordas).eq(8).should('have.value', 'Chocolate Branco')
        cy.get(this.selectorList().quantMais).eq(8).click()
        cy.get(this.selectorList().quantMenos).eq(8).click()
        cy.get(this.selectorList().quant).eq(8).should('have.value', '1')
        cy.get(this.selectorList().buttonAdd).eq(8).click()
        cy.get(this.selectorList().allButtons).eq(43).click()

        cy.get(this.selectorList().item).eq(1).then(($option) => {

            cy.wrap($option).scrollIntoView()

        })
        cy.get(this.selectorList().bordas).eq(1).select(1)
        cy.get(this.selectorList().bordas).eq(1).should('have.value', 'Chocolate ao leite')
        cy.get(this.selectorList().quant).eq(1).should('have.value', '1')
        cy.get(this.selectorList().buttonAdd).eq(1).click()
        cy.get(this.selectorList().allButtons).eq(8).click()

        cy.get(this.selectorList().carrinho).click()
        cy.get(this.selectorList().precoIndividual).eq(0).should('have.text', 'R$ 65,80').and('be.visible')//para elementos <td> usar have.text
        cy.get(this.selectorList().precoIndividual).eq(1).should('have.text', 'R$ 65,80').and('be.visible')
        cy.get(this.selectorList().precoTotal).eq(1).should('have.text', 'R$ 131,60').and('be.visible')
        cy.get(this.selectorList().observacao).type('Capricha em dobro nessas pizzas ai em rapá.')
        cy.get(this.selectorList().finalizar).click()
        cy.get(this.selectorList().rua).type('Av. Rua Estrada')
        cy.get(this.selectorList().numero).type('0')
        cy.get(this.selectorList().bairro).type('Rodovia')
        cy.get(this.selectorList().complemento).type('É a com asfalto')
        cy.get(this.selectorList().cep).type('86300-188')
        cy.get(this.selectorList().referencia).type('É um cadinho pra direita e outro pra esquerda')  
        cy.get(this.selectorList().tipoEntrega).select('🚚 Entrega (+R$ 3,00)')
        cy.get(this.selectorList().pagamento).select('💳 Cartão de Débito')
        cy.get(this.selectorList().precoFinal).should('have.text', 'R$ 134,60')
        cy.get(this.selectorList().enviarPedido).click()
        //cy.readFile('cypress/downloads/pedido-pizzaria.pdf').should('exist')
    }

    compraBebidas(){
        cy.get(this.selectorList().bebidas).click()
        cy.get(this.selectorList().item).eq(0).then(($option) => {
            cy.wrap($option).scrollIntoView()
        })
        cy.get(this.selectorList().allButtons).eq(2).click()
        cy.get(this.selectorList().item).eq(6).then(($option) => {
            cy.wrap($option).scrollIntoView()
        })
        cy.get(this.selectorList().mudar600ml).dblclick()
        cy.get(this.selectorList().quantMais).eq(6).click()
        cy.get(this.selectorList().quant).eq(6).should('have.value', '2')
        cy.get(this.selectorList().addRefri600ml).click()
        cy.get(this.selectorList().item).eq(11).then(($option) => {
            cy.wrap($option).scrollIntoView()
        })
        cy.get(this.selectorList().allButtons).eq(37).click()

        cy.get(this.selectorList().carrinho).click()
        cy.get(this.selectorList().precoIndividual).eq(0).should('have.text', 'R$ 5,00').and('be.visible')
        cy.get(this.selectorList().precoIndividual).eq(1).should('have.text', 'R$ 16,00').and('be.visible')
        cy.get(this.selectorList().precoIndividual).eq(2).should('have.text', 'R$ 35,00').and('be.visible')
        cy.get(this.selectorList().precoTotal).eq(1).should('have.text', 'R$ 56,00').and('be.visible')
        cy.get(this.selectorList().finalizar).click()
        cy.get(this.selectorList().rua).type('Av. Rua Estrada')
        cy.get(this.selectorList().numero).type('0')
        cy.get(this.selectorList().bairro).type('Rodovia')
        cy.get(this.selectorList().complemento).type('É a com asfalto')
        cy.get(this.selectorList().cep).type('86300-188')
        cy.get(this.selectorList().referencia).type('É um cadinho pra direita e outro pra esquerda')  
        cy.get(this.selectorList().tipoEntrega).select('🚚 Entrega (+R$ 3,00)')
        cy.get(this.selectorList().pagamento).select('💵 Dinheiro')
        cy.get(this.selectorList().troco).type('20,25')
        cy.get(this.selectorList().precoFinal).should('have.text', 'R$ 59,00')
        cy.get(this.selectorList().enviarPedido).click()
        //cy.readFile('cypress/downloads/pedido-pizzaria.pdf').should('exist')
    }

    compraPersonalizada(){

    }

}
export default PizzaPage