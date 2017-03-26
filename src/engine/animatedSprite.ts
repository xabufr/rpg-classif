export interface AnimationDefinition {
    name: string;
    frames: {
        x: number;
        y: number;
    }[];
}

export interface SpritesheetDefinition {
    frameWidth: number;
    frameHeight: number;
}

export class Animation {
    public isPlaying: boolean;
    constructor(public name: string,
                public textures: PIXI.Texture[], private sprite: AnimatedSprite) {
        this.isPlaying = false;
    }

    public play() {
        this.sprite.setCurrentAnimation(this);
        this.sprite.play();
        this.isPlaying = true;
    }

    public stop() {
        this.sprite.stop();
        this.isPlaying = false;
    }
}

interface AnimationDic {
    [name: string]: Animation;
}

export class AnimatedSprite extends PIXI.extras.AnimatedSprite {
    private animations: AnimationDic;
    constructor(texture: PIXI.Texture, spriteDefinition: SpritesheetDefinition, animations: AnimationDefinition[]) {
        let baseTexture = texture.baseTexture;
        let frames: PIXI.Texture[][] = [];
        let nbXFrames = baseTexture.width / spriteDefinition.frameWidth;
        let nbYFrames = baseTexture.height / spriteDefinition.frameHeight;
        let spriteW = spriteDefinition.frameWidth;
        let spriteH = spriteDefinition.frameHeight;
        for (let x = 0; x < nbXFrames; ++x) {
            frames[x] = [];
            for (let y = 0; y < nbYFrames; ++y) {
                frames[x][y] = new PIXI.Texture(baseTexture, new PIXI.Rectangle(x * spriteW, y * spriteH, spriteW, spriteH));
            }
        }
        let _animations: AnimationDic = {};
        animations.map(anim => {
            let textures = anim.frames.map(f => frames[f.x][f.y]);
            return new Animation(anim.name, textures, this);
        }).forEach(anim => {
            _animations[anim.name] = anim;
        });
        super([frames[0][0]]);
        this.animations = _animations;
        this.animationSpeed = 0.1;
    }

    public setCurrentAnimation(anim: string | Animation) {
        if (typeof anim === "string") {
            anim = this.animations[anim];
        }
        this.textures = anim.textures;
    }

    public getAnimation(name: string) {
        return this.animations[name];
    }

    public getAnimations() {
        return this.animations;
    }
}
