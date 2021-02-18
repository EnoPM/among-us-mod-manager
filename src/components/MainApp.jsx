import React from "react";

class MainApp extends React.Component {

    state = {
        filter: ''
    };

    changeFilter = e => {
        this.setState({filter: e.target.value});
    };

    getFilteredMods = () => {
        return this.props.mods.filter(mod => {
            return mod.name.toLowerCase().includes(this.state.filter.toLowerCase());
        });
    };

    render() {
        return (
            <div className="app-container">
                <div className="mods-list-container">
                    <input value={this.state.filter} onChange={this.changeFilter} placeholder="Search..." className="mods-list-search" type="text"/>
                    <div className="mods-list">
                        {this.getFilteredMods().map(mod => (
                            <div key={mod.id} className="mods-item">
                                <img alt="icon" className="mods-icon" src={mod.icon}/>
                                <div className="mods-content">
                                    <div className="mods-name">{mod.name}</div>
                                    <div className="mods-author">by {mod.author}</div>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
                <div className="mods-screen-container">

                </div>
            </div>
        );
    }
}

export default MainApp;