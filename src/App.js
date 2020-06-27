import React from 'react';
import {getClient} from './helpers';

import RewardPlaceholder from './components/RewardPlaceholder';
import RewardField from './components/RewardField';

export default class extends React.PureComponent { 
	constructor(props) {
		super(props);
		this.state = {};
	}

	expandContainer(){ 
		const {autoExpandSummary} = this.props.config;
		if(!autoExpandSummary){return}

		// Expand summary view on mobile, if closed
		var summaryButton = document.querySelector('[data-trekkie-id="order_summary_toggle"]');
		var isExpanded = summaryButton.getAttribute("aria-expanded");
		if(isExpanded === 'false'){
			summaryButton.click();	
		}
	}

	componentWillUnmount(){
		this.unmounted = true;
	}

	componentDidMount(){
		this.initClient();
		this.expandContainer();
		setInterval(this.refreshBalance, 1000 * 60)
	}

	initClient(){
		getClient(this.props.config).then(client=>{
			if(client && client.ready){
				this.client = client;
				this.client.on('shapes.balances.ready', balances => this.setState(balances))
				this.client.on('shapes.balances.update', balances => this.setState(balances))
				this.client.hydrate('balances');
				return
			}

			console.error('Could not create shapes client');

			this.setState({
				error: true
			})
		});
	}

	refreshBalance(){
		if(this.client){
			this.client.get('balances', false, true).catch(e=>{
				console.log(e);
			})
		}
	}

	toggleBlock(show){
		const {element} = this.props;
		let baseStyle = "border-bottom:1px solid rgba(175,175,175,0.34)";

		if(show && element.style.display === "none"){
			element.style.cssText = baseStyle;
		}

		if(!show && element.style.display !== "none"){
			element.style.cssText = "display:none"
		}
	}

	render() {
		const {init, data, error} = this.state;
		const {
			hideIfInactive,
			supportEmail,
			title = 'Loyalty rewards available:',
			errorMessage = "There was an issue retrieving your reward balance. Please try again shortly or get in touch with customer support.", 
			loadingMessage = "Just a moment as we set up your account",
		} = this.props.config;
		
		if(!init){
			return(
				<RewardPlaceholder
					error={error}
					title={title}
					loadingMessage={loadingMessage} 
					errorMessage={errorMessage}
					supportEmail={supportEmail}
					hideIfInactive={hideIfInactive}
					toggleBlock={this.toggleBlock.bind(this)}
				/>
			)
		}

		if(error || !data || !data.hasOwnProperty('combined_balance_dollars')){
			return(
				<RewardPlaceholder
					error={true}
					title={title}
					loadingMessage={loadingMessage} 
					errorMessage={errorMessage}
					supportEmail={supportEmail}
					hideIfInactive={hideIfInactive}
					toggleBlock={this.toggleBlock.bind(this)}
				/>
			)
		}
		return(
			<RewardField
				maxBalance={data.combined_balance_dollars || 0}
				config={this.props.config}
				title={title}
				toggleBlock={this.toggleBlock.bind(this)}
			/>
		)
	}
}

