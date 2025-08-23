import Configs from './configs.js';

/**
 * Classe responsável por manipular os elementos HTML da página.
 */
export default class Interface {
    constructor() {
        this.moveset_display = document.getElementById(Configs.html.moveset_display);
        this.play_button = document.getElementById(Configs.html.play_button);
        this.restart_button = document.getElementById(Configs.html.restart_button);
        this.team_button = document.getElementById(Configs.html.team_button);
        this.erase_button = document.getElementById(Configs.html.erase_button);
        this.move_buttons = document.getElementsByClassName(Configs.html.move_buttons);
        this.repeat_button = document.getElementById('repeat-move');
        this.last_move = undefined;
        this.moveset = [];
        this.last_repeat_number = undefined;
    }

    /**
     * Adiciona as funções para os botões do painel de controle.
     */
    addEventListeners(fplay, frestart, fteam) {
        this.play_button.addEventListener('click', () => { fplay(); });
        this.restart_button.addEventListener('click', () => { frestart(); });
        this.team_button.addEventListener('click', () => { fteam(); });
        this.erase_button.addEventListener('click', () => this.deleteLastMove());
        for (const button of this.move_buttons) {
            button.addEventListener('click', () => { this.addMove(button.id); });
        }
        if (this.repeat_button !== null) {
            this.repeat_button.addEventListener('click', () => { this.addRepeat(); });
        }
    }

    /**
     * Retorna a quantidade de movimentos contidos no display.
     */
    getMoveAmount() {
        return this.moveset_display.children.length;
    }

    /**
     * Retorna um array contendo strings relativas ao id de cada movimento do display.
     */
    getMoveList() {
        return this.moveset;
    }

    /**
     * Adiciona um movimento à lista de movimentos do display.
     */
    addMove(id) {
        if (this.getMoveAmount() === Configs.html.display_max_commands) {
            return;
        }
        const element = document.createElement('img');
        element.className = `display-${id}`;
        let name = id.split('-').join('_');
        element.src = `${Configs.assets.path}/${name}.png`;
        element.width = Configs.assets.display_icon_default_size;
        element.height = Configs.assets.display_icon_default_size;
        this.moveset_display.appendChild(element);
        this.last_move = name;
        this.moveset.push(name);
        console.log(this.moveset);
    }

    addRepeat() {
        if (this.last_move === undefined || this.last_move === 'repeat-move') {
            return;
        }
        const element = document.createElement('img');
        element.className = `display-repeat-move`;
        element.src = `${Configs.assets.path}/repeat_move.png`;
        element.width = Configs.assets.display_icon_default_size;
        element.height = Configs.assets.display_icon_default_size;
        this.moveset_display.appendChild(element);
        const moves = parseInt(prompt('Digite o número de vezes que o último movimento será executado:')) - 1;
        this.last_repeat_number = moves;
        for (let i = 0; i < moves; i++) {
            this.moveset.push(this.last_move);
        }
        this.last_move = 'repeat-move';
        console.log(this.moveset);
    }

    /**
     * Remove o último movimento da lista de movimentos do display.
     */
    deleteLastMove() {
        if (this.getMoveAmount() !== 0) {
            if (this.last_move === 'repeat-move') {
                for (let i = 0; i < this.last_repeat_number - 1; i++) {
                    this.moveset.pop();
                }
            }
            this.moveset_display.removeChild(this.moveset_display.lastChild);
        }
        if (this.getMoveAmount() === 0) {
            this.last_move = undefined;
        }
        else {
            this.last_move = this.moveset[this.moveset.length - 1];
        }
        this.moveset.pop();
        console.log(this.moveset);
    }

    /**
     * Remove todos os movimentos da lista de movimentos do display.
     */
    deleteAllMoves() {
        while (this.getMoveAmount() !== 0) {
            this.moveset_display.removeChild(this.moveset_display.lastChild);
        }
        this.last_move = undefined;
        this.moveset = [];
        console.log(this.moveset);
    }
}