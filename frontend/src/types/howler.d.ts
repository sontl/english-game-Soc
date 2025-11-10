declare module "howler" {
  interface HowlOptions {
    src: string[];
    html5?: boolean;
  }

  export class Howl {
    constructor(options: HowlOptions);
    play(): number;
    unload(): void;
  }
}
