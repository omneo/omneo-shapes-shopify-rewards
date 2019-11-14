import React from 'react';
import {fetch as fetchPolyfill} from 'whatwg-fetch'
export default class extends React.PureComponent {
    constructor(props) {
        super(props);
        const {config} = this.props;

        this.state = {
            redeem: config.rewardApplied !== false ? config.rewardApplied : this.getMax(),
            loading: false
        };

        this.onChange = this.onChange.bind(this);
        this.applyRewards = this.applyRewards.bind(this);
        this.removeRewards = this.removeRewards.bind(this);
    }

    checkCartCanUseReward(){
        // const isRewardApplied = this.isRewardApplied();
        // if(!isRewardApplied){return}

        // const max = this.getMax();
        // const {redeem} = this.state;

        // if(max <= 0 || parseFloat(redeem) > parseFloat(max)){
        //     this.removeRewards();
        // }
    }

    componentDidMount(){
        this.checkCartCanUseReward();
    }

    getMax(){
        const {config, maxBalance} = this.props;
        const {subTotal} = config;
        if(subTotal === null){return maxBalance}
        let subTotalValue = parseInt(subTotal) / 100;

        return subTotalValue < maxBalance ? subTotalValue : maxBalance;
    }

    validate(string){
        var pattern = new RegExp(/^[0-9]+\.?[0-9]{0,2}$/);
        return pattern.test(string);
    }

    onChange(e){
        if(e.key && e.key === "Enter"){return}
        e.preventDefault();

        let value = e.target.value;
        if(e.key){
            value = e.target.value+e.key;
        }

        if(value !== ''){
            if(!this.validate(value)){return;}
            if(parseFloat(value) > this.getMax()){
                this.setState({redeem: this.getMax()});
                return;
            }
        }

        this.setState({
            redeem: value
        })
    }

    applyRewards(e){
        if(e){e.preventDefault()}
        const {config} = this.props;
        const {redeem} = this.state;
        const {rewardVariantId} = config;
        this.setState({
            loading: true
        });

        fetchPolyfill('/cart/add.js',{
            method:"POST",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quantity: 1,
                id: rewardVariantId,
                properties: {
                    amount: redeem
                }
            })
        }).then(function(response){
            if(response.ok){ location.reload();}
        });
    }

    removeRewards(e){
        if(e){e.preventDefault()}
        const {rewardVariantId} = this.props.config;
        this.setState({
            loading: true
        });
        fetchPolyfill('/cart/update.js',{
            method:"POST",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                updates: {
                    [rewardVariantId]: 0
                }
            })
        }).then(function(response){
            if(response.ok){ location.reload();}
        });
    }

    buttonClasses(){
        const {maxBalance} = this.props;
        const {redeem, loading} = this.state;
        let classes = ["field__input-btn","btn"];
        if(!redeem || redeem == 0 || redeem === '' || maxBalance == 0){classes.push("btn--disabled")}
        if(loading){classes.push("btn--loading")}
        return classes.join(' ');
    }

    isRewardApplied(){
        return this.props.config.rewardApplied !== false;
    }

    getMaxDisplay(isRewardApplied){
        const {maxBalance} = this.props;
        const {redeem} = this.state;

        if(isRewardApplied){
            return [
                <span key="max" style={{textDecoration:'line-through', opacity: .5, marginRight: '5px'}}>${maxBalance}</span>,
                <span key="redeem">${(parseFloat(maxBalance) - parseFloat(redeem)).toFixed(2)} (after checkout)</span>
            ]
        }
        return '$'+maxBalance
    }

    getSvg(){
        var useTag = '<use xlink:href="/svg/svg-sprite#my-icon" />';
        return <svg dangerouslySetInnerHTML={{__html: useTag }} />;
    }

    render() {
        const {maxBalance, config, title, toggleBlock} = this.props;
        const {redeem, loading} = this.state;
        const buttonDisabled = loading || redeem === '' || redeem == 0 || maxBalance <= 0;

        if(config.hideIfInactive && maxBalance <= 0){
            toggleBlock(false)
            return null
        }

        toggleBlock(true)
        const isRewardApplied = this.isRewardApplied();

        return (
            <div className="fieldset">
                <form onSubmit={isRewardApplied ? this.removeRewards : this.applyRewards}>
                    <div className="field field--show-floating-label">
                        <h3 style={{marginBottom: 20}}>{title} {this.getMaxDisplay(isRewardApplied)}</h3>
                        <div className="field__input-btn-wrapper">
                            <div className="field__input-wrapper">
                                <label className="field__label field__label--visible" htmlFor="checkout_reduction_code">{isRewardApplied ? "Rewards applied" : "Apply reward value"} ($)</label>
                                <input
                                    placeholder="0"
                                    className="field__input"
                                    size="30"
                                    type="text"
                                    value={redeem}
                                    id="redeem"
                                    disabled={loading || isRewardApplied}
                                    onChange={this.onChange}
                                    style={isRewardApplied? {opacity: 0.5} : {}}
                                />
                            </div>
                            <button
                                type="submit"
                                onClick={isRewardApplied ? this.removeRewards : this.applyRewards}
                                className={this.buttonClasses()}
                                style={buttonDisabled ? {backgroundColor: '#c8c8c8 !important'} : {}}
                                disabled={buttonDisabled}
                                aria-busy={loading}
                            >
                                <span className="btn__content visually-hidden-on-mobile">{isRewardApplied ? "Remove" : "Apply"}</span>
                                
                                {
                                    isRewardApplied ? (
                                        <svg 
                                            className="icon-svg icon-svg--size-16 btn__icon shown-on-mobile" 
                                            aria-hidden={loading} 
                                            focusable="false"
                                            dangerouslySetInnerHTML={{__html:'<use xlink:href="#close" />'}}
                                        />
                                    ):(
                                        <svg 
                                            className="icon-svg icon-svg--size-16 btn__icon shown-on-mobile" 
                                            aria-hidden={loading} 
                                            focusable="false"
                                            dangerouslySetInnerHTML={{__html:'<use xlink:href="#arrow" />'}}
                                        />
                                    )
                                }
                                <svg 
                                    className="icon-svg icon-svg--size-18 btn__spinner icon-svg--spinner-button" 
                                    aria-hidden={!loading} 
                                    focusable="false" 
                                    dangerouslySetInnerHTML={{__html:'<use xlink:href="#spinner-button" />'}}
                                />
                            </button>
                        </div>
                        <small style={{marginTop: 10, display: 'block', lineHeight:1}}>Rewards are not redeemable against gift cards or shipping</small>
                    </div>
                </form>
            </div>
        )
    }
}