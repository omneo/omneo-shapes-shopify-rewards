import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';
import App from './App';

const init = config => {
    const run = () => {
        const summarySections = document.getElementsByClassName('order-summary__sections');
        if(!summarySections[0]){return;}
        const el = document.createElement("div");
        el.id = 'omneo-shopify-checkout-rewards';
        el.className = "order-summary__section";
        el.style.cssText = "border-bottom: 1px solid rgba(175,175,175,0.34)";
        summarySections[0].insertBefore(el, summarySections[0].children[1]);

        ReactDOM.render(<App config={config} element={el}/>, el);
    }
    
    document.addEventListener("DOMContentLoaded", run);
}


export default {
	init
}