import Configs from './configs.js';

/**
 * Classe responsável por manipular os elementos HTML da página.
 */
export default class Interface {
    constructor() {
        this.is_singleplayer = true;
        this.moveset_display = document.getElementById(Configs.html.moveset_display);
        if (this.moveset_display === null) {
            this.is_singleplayer = false;
            this.moveset_display = document.getElementById('main-content-game-controls-display-multiplayer');
        }
        this.play_button = document.getElementById(Configs.html.play_button);
        this.restart_button = document.getElementById(Configs.html.restart_button);
        this.team_button = document.getElementById(Configs.html.team_button);
        this.erase_button = document.getElementById(Configs.html.erase_button);
        this.move_buttons = document.getElementsByClassName(Configs.html.move_buttons);
        this.repeat_button = document.getElementById('repeat-move');
        this.moveset = [];
        this.repeat_block = [];
        this.is_creating_repeat_block = false;
        this.last_repeat_block_size = undefined;
        this.last_repeat_block_number = undefined;
    }

    /**
     * Adiciona as funções para os botões do painel de controle.
     */
    addEventListeners(fplay, frestart, fteam) {
        this.play_button.addEventListener('click', () => { fplay(); });
        if (frestart) this.restart_button.addEventListener('click', () => { frestart(); });
        if (fteam) this.team_button.addEventListener('click', () => { fteam(); });
        this.erase_button.addEventListener('click', () => this.deleteLastMove());
        for (const button of this.move_buttons) {
            button.addEventListener('click', () => { this.addMove(button.id); });
        }
        if (this.repeat_button !== null) {
            this.repeat_button.addEventListener('click', () => { this.addRepeat(); });
        }
    }

    /**
     * Adiciona um elemento à tela de display.
     */
    addToDisplay(element) {
        if (!this.is_singleplayer && this.moveset_display.children.length === 1) return;
        this.moveset_display.appendChild(element);
    }

    /**
     * Remove o último elemento do display.
     */
    removeLastFromDisplay() {
        this.moveset_display.removeChild(this.moveset_display.lastChild);
    }

    /**
     * Verifica a classe do último elemento do display.
     */
    lastDisplayElementClass(classname) {
        return this.moveset_display.children.length !== 0 && this.moveset_display.lastChild.className === classname;
    }

    /**
     * Retorna um array contendo strings relativas ao id de cada movimento do display.
     */
    getMoveList() {
        return this.moveset;
    }

    /**
     * Cria um elemento para o display de movimentos.
     */
    createMovement(id, type, src = undefined) {
        const element = document.createElement(type);
        element.className = `display-${id}`;
        element.width = Configs.assets.display_icon_default_size;
        element.height = Configs.assets.display_icon_default_size;
        if (type === 'img') {
            element.src = `${Configs.assets.path}/${src}.png`;
        }
        return element;
    }

    /**
     * Adiciona um movimento à lista de movimentos do display.
     */
    addMove(id) {
        if (this.is_creating_repeat_block && this.repeat_block.length === Configs.html.display_max_block_commands) {
            return;
        }
        const name = id.split('-').join('_');
        const element = this.createMovement(id, 'img', name);
        this.addToDisplay(element);
        if (this.is_creating_repeat_block) {
            this.repeat_block.push(name);
        }
        else {
            this.moveset.push(name);
        }
    }

    /**
     * Lê o número de repetições a serem feitas para o bloco de repetição.
     */
    readNumber(min, max) {
        while (true) {
            let num = Number(prompt(`Digite a quantidade de vezes que deseja repetir o bloco de comandos (mínimo ${min}, máximo ${max}):`));
            if (isNaN(num)) {
                alert('Digite um número!');
                continue;
            }
            if (num % 1 !== 0) {
                alert('Digite um número inteiro!');
                continue;
            }
            if (num < min || num > max) {
                alert('Digite um número entre 1 e 10!');
                continue;
            }
            return num;
        }
    }

    /**
     * Adiciona espaços vazios no display para inserir um bloco em uma nova linha.
     */
    fillDisplay() {
        while (this.moveset_display.children.length % Configs.html.display_max_commands !== 0) {
            const element = this.createMovement('empty-space', 'div');
            this.addToDisplay(element);
        }
    }

    /**
     * Abre/fecha o bloco de repetição no display.
     */
    addRepeat() {
        if (this.is_creating_repeat_block && this.repeat_block.length === 0) {
            return;
        }
        const element = this.createMovement('repeat-move', 'img', 'repeat_move');
        if (!this.is_creating_repeat_block) {
            this.is_creating_repeat_block = true;
            this.fillDisplay();
            this.addToDisplay(element);
            return;
        }
        const repeat = this.readNumber(1, 10);
        for (let i = 0; i < repeat; i++) {
            for (const move of this.repeat_block) {
                this.moveset.push(move);
            }
        }
        const repeat_display = document.createElement('div');
        repeat_display.className = `display-repeat-number`;
        repeat_display.innerHTML = repeat;
        this.addToDisplay(element);
        this.addToDisplay(repeat_display);
        this.fillDisplay();
        this.is_creating_repeat_block = false;
        this.last_repeat_block_size = this.repeat_block.length;
        this.last_repeat_block_number = repeat;
        this.repeat_block = [];
    }

    /**
     * Remove o último movimento da lista de movimentos do display.
     */
    deleteLastMove() {
        while (this.lastDisplayElementClass('display-empty-space')) {
            this.removeLastFromDisplay();
        }
        if (this.lastDisplayElementClass('display-repeat-number')) {
            for (let i = 0; i < this.last_repeat_block_size + 3; i++) {
                this.removeLastFromDisplay();
            }
            for (let i = 0; i < this.last_repeat_block_number * this.last_repeat_block_size; i++) {
                this.moveset.pop();
            }
            while (this.lastDisplayElementClass('display-empty-space')) {
                this.removeLastFromDisplay();
            }
            return;
        }
        if (this.lastDisplayElementClass('display-repeat-move')) {
            this.is_creating_repeat_block = false;
            this.removeLastFromDisplay();
            return;
        }
        if (this.moveset_display.children.length !== 0) {
            this.removeLastFromDisplay();
            if (this.is_creating_repeat_block) {
                this.repeat_block.pop();
            }
            else {
                this.moveset.pop();
            }
        }
    }

    /**
     * Remove todos os movimentos da lista de movimentos do display.
     */
    deleteAllMoves() {
        while (this.moveset_display.children.length !== 0) {
            this.removeLastFromDisplay();
        }
        this.moveset = [];
        this.repeat_block = [];
        this.is_creating_repeat_block = false;
    }
}