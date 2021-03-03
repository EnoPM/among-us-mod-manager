import React from "react";
import SettingsWindow from "./SettingsWindow.jsx";
import SettingsIcon from "./Icons/SettingsIcon.jsx";
import CloseIcon from "./Icons/CloseIcon.jsx";
import ModDetailsContainer from "./ModDetailsContainer.jsx";
import DownloadWindow from "./DownloadWindow.jsx";
import {SystemController} from "../client/system";

class MainApp extends React.Component {

    state = {
        filter: '',
        selection: null,
        settings: false,
        download: false
    };

    changeFilter = e => {
        this.setState({filter: e.target.value});
    };

    getFilteredMods = () => {
        return this.props.mods.filter(mod => {
            return mod.name.toLowerCase().includes(this.state.filter.toLowerCase());
        });
    };

    getModById = id => {
        for (const mod of this.props.mods) {
            if (mod.id === id) {
                return mod;
            }
        }
        return null;
    };

    selectModFunc = id => {
        return e => {
            this.setState({selection: id});
        };
    };

    toggleSettings = () => {
        const settings = !this.state.settings;
        if((this.props.config.amongUsFolder === undefined || this.props.config.amongUsFolder === '') && settings === false) {
            alert("Vous devez enregistrer votre exécutable Among Us avant de continuer");
        } else {
            this.setState({settings});
        }

    };

    toggleDownload = () => {
        const download = !this.state.download;
        this.setState({download});
    };

    playVanilla = () => {
        if(this.props.config.amongUsFolder === undefined || this.props.config.amongUsFolder === '') {
            alert("Vous devez enregistrer votre exécutable Among Us avant de continuer");
        } else {
            SystemController.playVanilla().then(() => {

            });
        }
    };

    componentDidMount() {
        if(this.props.config.amongUsFolder === undefined || this.props.config.amongUsFolder === '') {
            this.setState({settings: true}, () => {
                alert("Veuillez sélectionner votre exécutable Among Us dans les paramètres pour commencer");
            });
        }
    }

    render() {
        const selection = this.getModById(this.state.selection);
        return (
            <div className="app-container">
                {this.state.settings ? <SettingsWindow config={this.props.config} updateConfig={this.props.updateConfig}/> : null}
                {this.state.download ? <DownloadWindow updateInstalledMods={this.props.updateInstalledMods} mod={selection} toggleDownload={this.toggleDownload}/> : null}
                <div onClick={this.playVanilla} className="vanilla-button">
                    Jouer sans mod
                </div>
                <div className="settings-button" onClick={this.toggleSettings}>
                    {this.state.settings ? <CloseIcon/> : <SettingsIcon/>}
                </div>
                <div className="mods-list-container">
                    <input value={this.state.filter} onChange={this.changeFilter} placeholder="Rechercher..."
                           className="mods-list-search" type="text"/>
                    <div className="mods-list">
                        {this.getFilteredMods().map(mod => (
                            <div onClick={this.selectModFunc(mod.id)} key={mod.id} className="mods-item" data-selected={this.state.selection === mod.id ? 'true' : 'false'}>
                                <img alt="icon" className="mods-icon" src={mod.icon}/>
                                <div className="mods-content">
                                    <div className="mods-name">{mod.name}</div>
                                    <div className="mods-author">par {mod.author}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <ModDetailsContainer installedMods={this.props.installedMods} toggleDownload={this.toggleDownload} mod={selection}/>
            </div>
        );
    }
}

export default MainApp;