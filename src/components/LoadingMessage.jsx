import 'regenerator-runtime/runtime';
import React, {Component} from "react";

class LoadingMessage extends Component {

    state = {
        points: ''
    };

    interval = null;

    componentDidMount() {
        this.interval = setInterval(this.updatePoints, 500);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        this.interval = null;
    }

    updatePoints = () => {
        let points;
        switch (this.state.points) {
            case '':
                points = '.';
                break;
            case '.':
                points = '..';
                break;
            case '..':
                points = '...';
                break;
            case '...':
                points = '';
                break;
        }
        this.setState({points});
    };

    render() {
        return (
            <div className="loading-message">
                Loading mods{this.state.points}
            </div>
        );
    }
}

export default LoadingMessage;