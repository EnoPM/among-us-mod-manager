import React from "react";

class AnimatedBackground extends React.Component {
    render() {
        return (
            <>
                <div className="area" style={{height: this.props.height}}>
                    <ul className="circles">
                        <li/>
                        <li/>
                        <li/>
                        <li/>
                        <li/>
                        <li/>
                        <li/>
                        <li/>
                        <li/>
                        <li/>
                    </ul>
                    <div className="main-container">
                        {this.props.children}
                    </div>
                </div>
            </>
        );
    }
}

export default AnimatedBackground;