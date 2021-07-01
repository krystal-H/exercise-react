import React, { Component }  from 'react'
import { connect } from 'react-redux';

import './loading.scss'

const mapStateToProps = state => {
    return {
        loadingShow: state.getIn(['loadingShow', 'loadingShow'])
    }
}
const mapDispatchToProps = dispatch => {
    return {
        // getCatalogList: () => dispatch(getCatalogListAction()),
    }
}

const tops = [20,14.14214,0,-14.14214,-20,-14.14214,0,14.14214],
      lefts = [0,14.14214,20,14.14214,0,-14.14214,-20,-14.14214];

@connect(mapStateToProps, mapDispatchToProps)
export default class Loading extends Component  {
    render() {
        let {loadingShow} = this.props;
        return (
            loadingShow ?  
            <div className='loading_box'>
                <div className='ball-spin-fade-loader'>
                    {
                        [1,2,3,4,5,6,7,8].map((item,index) => {
                            // 其实这里没必要用css变量，calc中没法使用复杂的计算，这里是计算好之后传值到样式中的
                            // 这里是为了试试css变量，确实也减少了css行数
                            return <div style={{'--index':index,'--top':tops[index],'--left':lefts[index]}} key={item}></div>
                        })
                    }
                </div>
            </div> :
            null
        )
    }
}
