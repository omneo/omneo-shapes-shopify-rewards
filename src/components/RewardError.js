import React from 'react';
export default class extends React.PureComponent {
    render() {
        return (
            <div className="fieldset">
                <div className="field field--show-floating-label">
                    <h3 style={{marginBottom: 20}}>Loyalty rewards</h3>
                    <p>There was a problem getting rewards.</p>
                </div>
            </div>
        )
    }
}