import 'regenerator-runtime/runtime';
import React, {Component} from "react";
import AnimatedBackground from "./AnimatedBackground.jsx";
import LoadingMessage from "./LoadingMessage.jsx";
import MainApp from "./MainApp.jsx";
import {SystemController} from "../client/system";

class App extends Component {

    state = {
        loaded: false,
        modsList: [],
        installedMods: [],
        config: {}
    };

    updateInstalledMods = installedMods => {
        this.setState({installedMods});
    };

    updateModsList = modsList => {
        SystemController.setStorage('modsList', modsList).then(() => {
            this.setState({modsList});
        });
    };

    updateConfig = config => {
        SystemController.setStorage('config', config).then(() => {
            this.setState({config})
        });
    };

    getModsListFromApi = async () => {
        const response = await fetch("https://celib.at/among-us-mods/api.php");
        return await response.json();
    };

    getVersionFromApi = async () => {
        const response = await fetch("https://celib.at/among-us-mods/version.php");
        return (await response.json()).version;
    };

    getVersionFromLocalStorage = async () => {
        let version = await SystemController.getStorage('api-version');
        if(version) {
            return version.version;
        } else {
            return 0;
        }
    };

    catchUrl = () => {
        const htmlView = document.querySelector('#root');

        const isDescendant = (parent, child) => {
            let node = child.parentNode;
            while (node != null) {
                if (node === parent) {
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        }

        const configureOpenRenderedLinksInDefaultBrowser = () => {
            document.querySelector('body').addEventListener('click', event => {
                if (event.target.tagName.toLowerCase() === 'a' && isDescendant(htmlView, event.target)) {
                    event.preventDefault();
                    SystemController.openLink(event.target.href);
                }
            });
        }
        configureOpenRenderedLinksInDefaultBrowser();
    };

    initApp = async () => {
        const apiVersion = await this.getVersionFromApi();
        const localVersion = await this.getVersionFromLocalStorage();
        let modsList;
        if(apiVersion > localVersion) {
            modsList = await this.getModsListFromApi();
            await SystemController.setStorage('api-version', {version: apiVersion});
        } else {
            modsList = (await SystemController.getStorage('modsList'));
        }
        const config = await SystemController.getStorage('config') || {};
        const installedMods = await SystemController.getInstalledMods();
        this.updateConfig(config);
        this.updateModsList(modsList);
        this.updateInstalledMods(installedMods);
        this.catchUrl();
    };

    componentDidMount() {
        this.initApp().then(() => {
            this.setState({loaded: true});
        });
    }

    render() {
        return (
            <AnimatedBackground height="100vh">
                {this.state.loaded ? <MainApp config={this.state.config} updateConfig={this.updateConfig} mods={this.state.modsList} installedMods={this.state.installedMods} updateInstalledMods={this.updateInstalledMods}/> : <LoadingMessage/>}
            </AnimatedBackground>
        );
    }
}

export default App;