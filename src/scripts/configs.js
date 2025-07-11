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
        frame_delay: 500,
        field_rows: 8,
        field_cols: 5,
        tasks: {
            1: {half_field: true, has_goalkeeper: false, enemy_count: 5, friend_count: 0},
            2: {half_field: false, has_goalkeeper: false, enemy_count: 8, friend_count: 0},
            3: {half_field: false, has_goalkeeper: false, enemy_count: 6, friend_count: 3},
            4: {half_field: false, has_goalkeeper: true, enemy_count: 6, friend_count: 3}
        }
    };
}