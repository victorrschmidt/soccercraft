/**
 * Classe que instancia um objeto a ser renderizado no canvas.
 */
export class Entity {
    constructor(src, x, y, width, height) {
        this.image = new Image();
        this.image.src = src;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.loaded = false;
        this.image.onload = () => { this.loaded = true; };
    }

    /**
     * Renderiza a entidade.
     */
    draw(ctx) {
        if (this.loaded) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
}

export class Player extends Entity {
    constructor(src, x, y, width, height, team) {
        super(src, x, y, width, height);
        this.team = team;
    }
}