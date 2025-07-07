import Configs from './configs.js';

/**
 * Classe responsável por manipular os elementos HTML da página.
 */
export default class Interface {
    static moveset_display = document.getElementById(Configs.html.moveset_display);
    static play_button = document.getElementById(Configs.html.play_button);
    static restart_button = document.getElementById(Configs.html.restart_button);
    static team_button = document.getElementById(Configs.html.team_button);
    static erase_button = document.getElementById(Configs.html.erase_button);
    static move_buttons = document.getElementsByClassName(Configs.html.move_buttons);

    /**
     * Adiciona as funções para os botões do painel de controle.
     */
    static addEventListeners(fplay, frestart, fteam) {
        Interface.play_button.addEventListener('click', () => { fplay(); });
        Interface.restart_button.addEventListener('click', () => { frestart(); });
        Interface.team_button.addEventListener('click', () => { fteam(); });
        Interface.erase_button.addEventListener('click', Interface.deleteMove);
        for (const button of Interface.move_buttons) {
            button.addEventListener('click', () => { Interface.addMove(button.id); });
        }
    }

    /**
     * Retorna a quantidade de movimentos contidos no display.
     */
    static getMoveAmount() {
        return Interface.moveset_display.children.length;
    }

    /**
     * Retorna um array contendo strings relativas ao id de cada movimento do display.
     */
    static getMoveList() {
        return [...Interface.moveset_display.children].map((element) => element.className.split('-').slice(1).join('_'));
    }

    /**
     * Adiciona um movimento à lista de movimentos do display.
     * O movimento no display é um elemento <img>.
     */
    static addMove(id) {
        if (Interface.getMoveAmount() === Configs.html.display_max_commands) {
            return;
        }

        const element = document.createElement('img');
        element.className = `display-${id}`;
        element.src = `${Configs.assets.path}/${id.split('-').join('_')}.png`;
        element.width = Configs.assets.display_icon_default_size;
        element.height = Configs.assets.display_icon_default_size;
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