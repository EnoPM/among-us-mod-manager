import {Request} from './request';
import {SystemController} from './system';
import 'regenerator-runtime/runtime';
import Plivo from 'plivo-browser-sdk';
import io from 'socket.io-client';
//const SOCKET_URL = 'http://localhost:3002';
const SOCKET_URL = 'https://project.linkweb.fr:3001/';
export class Client {
    constructor(debug = false) {
        this.loginToken = null;
        this.system = new SystemController();
        this.request = new Request('https://project.linkweb.fr/api/ajax', this.system);
        this.plivo = new Plivo({
            "debug": debug ? 'ALL' : 'OFF',
            "permOnClick": true,
            "enableTracking": true,
            "closeProtection": true,
            "maxAverageBitrate": 48000,
            "allowMultipleIncomingCalls": false
        });
        this.session = null;
        this.socket = null;
    }

    async login(token) {
        this.loginToken = token;
        let login = await this.request.make('get', ['phone', 'authentication'], {token: this.loginToken});
        if(login.success) {
            this.request.accessToken = login.authorization;
            this.session = login.session;
            this.plivo.client.login(this.session.sip.username, this.session.sip.password);
            await this.plivoLogin();
            if(this.session.sip.inboundMusic) {
                this.plivo.client.setRingTone(this.session.sip.inboundMusic);
            }
            if(this.session.sip.outgoingMusic) {
                this.plivo.client.setRingToneBack(this.session.sip.outgoingMusic);
            }
            await this.socketLogin();
            return true;
        } else if(login.error) {
            return new Error(login.error);
        }
        return new Error('Login failed');
    }

    plivoLogin() {
        return new Promise(resolve => {
            this.plivo.client.on('onLogin', () => {
                resolve(true);
            });
        });
    }

    socketLogin() {
        return new Promise((resolve, reject) => {
            this.socket = io(SOCKET_URL);
            this.socket.on('connect', () => {
                this.socket.emit('session.info', {userId: this.session.id});
                resolve(true);
            });
        });
    }

    getContact(number) {
        return new Promise(resolve => {
            this.socket.emit('get.contact', {number});
            this.socket.once('get.contact.response', data => {
                resolve(data);
            });
        });
    }

    async contacts() {
        return await this.request.make('get', ['phone', 'contacts']);
    }

    async pause(uuid) {
        return await this.request.make('get', ['phone', 'pause'], {uuid});
    }

    async focusWindow() {
        return await this.system.focusWindow();
    }
}