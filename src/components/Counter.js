import React, { Component } from 'react';

export default class Counter extends Component {
    render() {
        let {astrictNub,str} = this.props;
        return (
            <div className='counter' style={{color:str.length>astrictNub?'#ea4d2e':''}}>
                <span>{str.length}</span>/<span>{astrictNub}</span>
            </div>
        );
    }
}
