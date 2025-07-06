import Assets from './assets.js';

export default class Interface {
    static moveset_display = document.getElementById('main-content-game-controls-display');
    static play_button = document.getElementById('play-button');
    static restart_button = document.getElementById('restart-button');
    static team_button = document.getElementById('team-button');
    static erase_button = document.getElementById('erase-button');
    static move_buttons = document.getElementsByClassName('move-button');

    /**
     * Adiciona as funções para os botões do painel de controle.
     */
    static addEventListeners(fplay, frestart, fteam) {
        Interface.play_button.addEventListener('click', () => { fplay(); });
        Interface.restart_button.addEventListener('click', () => { frestart(); });
        Interface.team_button.addEventListener('click', () => { fteam(); });
        Interface.erase_button.addEventListener('click', Interface.deleteMove);
        for (const button of Interface.move_buttons) {
            button.addEventListener('click', () => {
                Interface.addMove(button.id);
            });
        }
    }

    /**
     * Retorna a quantidade de movimentos contidos no display (máx = 24).
     */
    static getMoveAmount() {
        return Interface.moveset_display.children.length;
    }

    /**
     * Retorna um array contendo strings relativas aos movimentos.
     */
    static getMoveList() {
        return [...Interface.moveset_display.children].map((element) =>
            element.className.split('-').slice(1).join('_'));
    }

    /**
     * Adiciona um movimento à lista de movimentos do display.
     * O movimento no display é um elemento <img>.
     */
    static addMove(id) {
        if (Interface.getMoveAmount() === 24) {
            return;
        }

        const element = document.createElement('img');
        element.className = `display-${id}`;
        element.src = `${Assets.path}/${id.split('-').join('_')}.png`;
        element.width = Assets.display_icon_default_size;
        element.height = Assets.display_icon_default_size;
        Interface.moveset_display.appendChild(element);
    }

    /**
     * Remove o último movimento da lista de movimentos do display.
     * O último elemento <img> na <div> do display é removida.
     */
    static deleteMove() {
        if (Interface.getMoveAmount() !== 0) {
            Interface.moveset_display.removeChild(Interface.moveset_display.lastChild);
        }
    }
}