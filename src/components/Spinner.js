import React from 'react';
export default class extends React.PureComponent {
    constructor() {
        super();
        this.state = {
            init: false
        };
    }
    componentDidMount(){
        setTimeout(()=>{
            this.setState({init:true})
        },16);

    }
    render() {
        const {init} = this.state;
        const styles = {
            position: 'absolute',
            boxSizing: 'border-box',
            top: '12px',
            right: '10px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: '2px solid #ccc',
            borderTopColor:'#333',
            opacity: init ? 1 : 0,
            transition: '30s linear transform, 0.3s ease opacity',
            transform: init ? 'rotate(10800deg)' : 'none'
        };
        return (
            <div style={styles}/>
        )
    }
}