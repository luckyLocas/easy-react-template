import root from "./root";
import container from './container';
import { Model } from "../framework/d.ts/model";

const allModels: { [key: string]: Model<any> } = {
    root,
    container,
}

export type AllState = {
    [k in keyof typeof allModels]: any
}

export default allModels;