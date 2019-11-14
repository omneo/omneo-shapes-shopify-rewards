import React from 'react';
import Spinner from './Spinner';
export default class extends React.PureComponent {
    render() {
        const {loadingMessage, errorMessage, supportEmail, hideIfInactive, title, error, toggleBlock} = this.props;
        if(error){
            if(hideIfInactive){
                toggleBlock(false)
                return null
            }

            toggleBlock(true)

            return(
                <div className="fieldset">
                    <div className="field field--show-floating-label">
                        <p>{errorMessage}</p>
                        {supportEmail ? <a href={`mailto:${supportEmail}`} style={{marginTop: 10, display: 'block'}}>{environment.supportEmail}</a> : null}
                    </div>
                </div>
            )   
        }

        return (
            <div className="fieldset">
                <div className="field field--show-floating-label">
                    <h3 style={{marginBottom: 20}}>{title}</h3>
                    <div className="field__input-btn-wrapper">
                        <div className="field__input-wrapper">
                            <Spinner/>
                            <input
                                placeholder="Available rewards ($)"
                                className="field__input"
                                size="30"
                                type="text"
                                value=""
                                id="balance"
                                disabled={true}
                                style={{opacity:0.5}}
                            />
                        </div>
                        <button
                            type="submit"
                            className="field__input-btn btn btn--disabled"
                            style={{backgroundColor: "#c8c8c8 !important"}}
                            disabled={true}>
                            <span className="btn__content visually-hidden-on-mobile">Apply</span>
                            <i className="btn__content shown-on-mobile icon icon--arrow" />
                            <i className="btn__spinner icon icon--button-spinner" />
                        </button>
                    </div>
                    <p 
                        style={{
                            marginTop: 10,
                            display: 'block'
                        }}
                        children={loadingMessage || "Rewards are not redeemable against gift cards or shipping"}
                    />
                </div>
            </div>
        )
    }
}