function novoElemento(tagName, className) {
    const elem = document.createElement(tagName) 
    elem.className = className 
    return elem 
}

function Barreira(reversa = false) { // função construtora para criar barreiras
    this.elemento = novoElemento('div', 'barreira') // cria um elemento div com classe barreira

    const borda = novoElemento('div', 'borda') 
    const corpo = novoElemento('div', 'corpo') 
    this.elemento.appendChild(reversa ? corpo : borda) // acrescenta corpo ou borda
    this.elemento.appendChild(reversa ? borda : corpo) // acrescenta borda ou corpo

    this.setAltura = altura => corpo.style.height = `${altura}px` 
}


function ParDeBarreiras(altura, abertura, x) { // cria o par de barreiras
    this.elemento = novoElemento('div', 'par-de-barreiras') 
    
    this.superior = new Barreira(true) // cria uma nova barreira reversa 
    this.inferior = new Barreira(false) // cria uma nova barreira não-reversa 
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => { //sorteia posicao da barreira (eixo y)
        const alturaSuperior = Math.random() * (altura - abertura) 
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior) 
        this.inferior.setAltura(alturaInferior) 
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0]) // pega a posição atual de x
    this.setX = x => this.elemento.style.left = `${x}px` // altera a posição x
    this.getLargura = () => this.elemento.clientWidth // clientWidth pega a largura do elemento, incluindo padding, mas não incluindo bordas

    this.sortearAbertura()
    this.setX(x)
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) { // adiciona a animação as 4 barreiras
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura), // cria-se as barreiras e sua posição
        new ParDeBarreiras(altura, abertura, largura + espaco), 
        new ParDeBarreiras(altura, abertura, largura + espaco * 2), 
        new ParDeBarreiras(altura, abertura, largura + espaco * 3) 
    ]

    const deslocamento = 3 // deslocamento das barreiras será de 3px

    this.animar = () => { //  desloca as barreiras na horizontal para esquerda
        this.pares.forEach(par => { 
            par.setX(par.getX() - deslocamento)
            if(par.getX() < -par.getLargura()) { 
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura() // sorteia nova abertura da barreira para aparecer em uma posição diferente
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio 
                && par.getX() < meio // verifica se passou o meio
            if(cruzouOMeio) notificarPonto() // se verdadeiro soma-se um ponto
        })
    }
}

function Passaro(alturaJogo) { // adiciona o pássaro e sua animação no jogo
    let voando = false 

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = '../imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px` // função que altera a posição y

    window.onkeydown = e => voando = true // altera variável voando 
    window.onkeyup = e => voando = false // quando se solta a tecla, voando será false

    this.animar = () => { // faz o pássaro voar
        const novoY = this.getY() + (voando ? 8 : -5) // muda altura do passáro
        const alturaMaxima = alturaJogo - this.elemento.clientHeight // faz com que o pássaro não passe da tela

        if (novoY <= 0) { // verificação para fazer com que o pássaro não passe do chão do jogo
            this.setY(0)
        } else if (novoY >= alturaMaxima) { // verificação para fazer com que o passaro não passe do teto do jogo
            this.setY(alturaMaxima)
        } else { 
            this.setY(novoY)
        }
    }
    
    this.setY(alturaJogo / 2) // altura inicial do pássaro
}


function Progresso() { // criar o progresso do jogo e atualizar os pontos de progresso
    this.elemento = novoElemento('span', 'progresso') 
    
    this.atualizarPontos = pontos => { // atualiza os pontos na tela do jogo
        this.elemento.innerHTML = pontos 
    }
    
    this.atualizarPontos(0) // 0 pontos -start
}

function estaoSobrepostos(elementoA, elementoB) { // função que verifica se passaro e barreira estao sobrepostos
    const a = elementoA.getBoundingClientRect() 
    const b = elementoB.getBoundingClientRect() 

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left

    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical 
}

function colidiu(passaro, barreiras) { // testar a colisão entre o pássaro e as barreiras
    let colidiu = false 

    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu) { 
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento

            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu  // o jogo acaba
}

function GameOver() { //função de acabar o jogo
    this.elemento = novoElemento('span', 'game-over')
    this.elemento.innerHTML = 'Game Over'
}

function RestartMessage() {
    this.elemento = novoElemento('span', 'restart')
    this.elemento.innerHTML = 'Press F5 to restart' 
}

function FlappyBird() { // função que adiciona funções ao jogo
    let pontos = 0 

    const areaDoJogo = document.querySelector('[wm-flappy]') 
    const altura = areaDoJogo.clientHeight 
    const largura = areaDoJogo.clientWidth 

    const progresso = new Progresso()
    const passaro = new Passaro(altura)
    const fimJogo = new GameOver()
    const restart = new RestartMessage()
    const barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(++pontos))
   
    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)) { // verifica se houve colisão 
                clearInterval(temporizador) // se houve colisão o jogo é parado
                areaDoJogo.appendChild(fimJogo.elemento) // mensagem de Game Over
                areaDoJogo.appendChild(restart.elemento) // mensagem de Restart
            }
        }, 20)
    }
}

new FlappyBird().start() //começa