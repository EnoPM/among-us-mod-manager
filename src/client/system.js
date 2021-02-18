import {ipcRenderer} from 'electron';
export class SystemController {

    static async moveMouse(data) {
        return await this._trigger('mouse.move', data);
    }

    static async clickMouse(data) {
        return await this._trigger('mouse.click', data);
    }

    static async _trigger(name, data) {
        return ipcRenderer.sendSync(name, data);
    }
}