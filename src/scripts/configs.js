/**
 * Classe contendo configurações globais sobre os arquivos do projeto.
 */
export default class Configs {
    static assets = {
        path: '../assets',
        background_file_name: 'background.png',
        display_icon_default_size: 40,
        game_player_default_size: {
            width: 33,
            height: 65
        }
    };
    static html = {
        main_content_game_screen_canvas: 'main-content-game-screen-canvas',
        moveset_display: 'main-content-game-controls-display',
        play_button: 'play-button',
        restart_button: 'restart-button',
        team_button: 'team-button',
        erase_button: 'erase-button',
        move_buttons: 'move-button',
        display_max_commands: 24
    };
    static game = {
        field_rows: 8,
        field_cols: 5
    };
}