import {ipcRenderer} from 'electron';
export class SystemController {

    static async getStorage(name) {
        return await this._trigger('storage.get', {
            key: name
        });
    }

    static async setStorage(name, value) {
        return await this._trigger('storage.set', {
            key: name,
            value
        });
    }

    static async downloadFile(mod) {
        return this._triggerAsync('download.zip', {
            mod
        });
    }

    static async getInstalledMods() {
        return await this._triggerAsync('get.installed.mods');
    }

    static async playMod(mod) {
        return await this._triggerAsync('play.mod', {mod});
    }

    static async playVanilla() {
        return await this._triggerAsync('play.vanilla');
    }

    static async openLink(link) {
        return await this._triggerAsync('open.link', {link});
    }

    static on(name, cb) {
        ipcRenderer.addListener(name, cb);
    }

    static off(name, cb) {
        ipcRenderer.removeListener(name, cb);
    }

    static async _trigger(name, data) {
        return ipcRenderer.sendSync(name, data);
    }

    static async _triggerAsync(name, data) {
        return await ipcRenderer.invoke(name, data);
    }
}