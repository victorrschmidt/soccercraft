import Configs from './configs.js';
import Interface from './interface.js';
import Template from './template.js';
import { Entity } from './entities.js';

export class SinglePlayerGame {
    constructor(task_number) {
        this.task_number = task_number;
        this.canvas = document.getElementById(Configs.html.main_content_game_screen_canvas);
        this.ctx = this.canvas.getContext('2d');
        this.background = new Entity(`${Configs.assets.path}/${Configs.assets.background_file_name}`, 0, 0, this.canvas.width, this.canvas.height);
        this.background.image.onload = this.checkLoadedImages;
        this.template = new Template(task_number);
        this.moveset = undefined;
        this.loaded_images = undefined;
        this.total_images = undefined;
    }

    loadImages() {
        this.loaded_images = Number(this.background.image.complete);
        this.total_images = this.template.player_list.length + 1;
        for (const player of this.template.player_list) {
            player.image.onload = this.checkLoadedImages;
        }
    }

    checkLoadedImages = () => {
        this.loaded_images++;
        if (this.loaded_images === this.total_images) {
            this.drawEntities();
        }
    }

    drawEntities = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.background.draw(this.ctx);
        for (const player of this.template.player_list) {
            player.draw(this.ctx);
        }
    }

    animate = () => {
        let stop = true;
        if (this.moves < this.move_count) {
            this.moves++;
            this.template.player_list[0].x -= 20;
            stop = false;
        }
        this.drawEntities();
        if (stop) {
            return;
        }
        requestAnimationFrame(this.animate);
    }

    generateTemplate = () => {
        this.template.generateNewTemplate();
        this.loadImages();
        Interface.deleteAllMoves();
    }

    getMoveset() {
        this.moveset = Interface.getMoveList();
    }

    changeTeam = () => {
        this.template.changeTeam();
        this.loadImages();
    }

    play = () => {
        this.moves = 0;
        this.move_count = 3;
        this.animate();
    }
}