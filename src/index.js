import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';
import App from './App';

const init = config => {
    (()=>{
        const summarySections = document.getElementsByClassName('order-summary__sections');
        if(!summarySections[0]){return;}
        const el = document.createElement("div");
        el.id = 'omneo-shopify-checkout-rewards';
        el.className = "order-summary__section";
        el.style = "border-bottom: 1px solid rgba(175,175,175,0.34)";
        summarySections[0].insertBefore(el, summarySections[0].children[1]);

        ReactDOM.render(<App config={config}/>, el);
    })();
}


export default {
	init
}