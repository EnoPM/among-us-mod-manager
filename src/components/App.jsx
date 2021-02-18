import 'regenerator-runtime/runtime';
import React, {Component} from "react";
import AnimatedBackground from "./AnimatedBackground.jsx";
import LoadingMessage from "./LoadingMessage.jsx";
import MainApp from "./MainApp.jsx";

class App extends Component {

    state = {
        loaded: false,
        modsList: []
    };

    componentDidMount() {
        setTimeout(() => {
            fetch("https://celib.at/amongus-mods.php").then(response => {
                response.json().then(modsList => {
                    this.setState({loaded: true, modsList});
                });
            });
        }, 2000);
    }

    render() {
        return (
            <AnimatedBackground height="100vh">
                {this.state.loaded ? <MainApp mods={this.state.modsList}/> : <LoadingMessage/>}
            </AnimatedBackground>
        );
    }
}

export default App;