import React from "react";
import {SystemController} from "../client/system";
import ReactMarkdown from 'react-markdown';
import behead from 'remark-behead';

class ModDetailsContainer extends React.Component {

    playMod = () => {
        SystemController.playMod(this.props.mod).then();
    };

    onLinkClick = (url) => {
        return (e) => {
            e.preventDefault();
            SystemController.openLink(url).then(() => {

            });
        };
    };

    renderLink = (props) => {
        return <a onClick={this.onLinkClick(props.href)} href={props.href} target="_blank">{props.children}</a>;
    };

    render() {
        return (
            <div className="mods-screen-container">
                {this.props.mod ? (
                    <>
                        <div className="header">
                            <img alt="icon" className="mods-icon" src={this.props.mod.icon}/> {this.props.mod.name}
                        </div>
                        <div className="body">
                            <div className="head-buttons">
                                {this.props.installedMods.includes(this.props.mod.id) ? (
                                    <div className="btn play" onClick={this.playMod}>Jouer</div>
                                ) : (
                                    <div className="btn install" onClick={this.props.toggleDownload}>Installer</div>
                                )}
                            </div>
                            <div className="description">
                                <ReactMarkdown renderers={{link: this.renderLink}} allowDangerousHtml={true}>{this.props.mod.description}</ReactMarkdown>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        );
    }
}

export default ModDetailsContainer;