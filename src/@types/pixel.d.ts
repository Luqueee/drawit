export interface PixelDataResponse {
    pixel?: Pixel;
    user?: User;
    found: boolean;
}

export interface Pixel {
    id: number;
    x: number;
    y: number;
    color: number;
    sub: string;
}

export interface User {
    id: number;
    sub: string;
    name: string;
    picture: string;
}
