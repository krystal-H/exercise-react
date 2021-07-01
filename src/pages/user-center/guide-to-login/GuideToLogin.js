import React, { Component } from 'react'
import { withRouter } from "react-router"
import { connect } from 'react-redux'
import { Modal,Icon,Button } from 'antd'
import { changeLoginModalStatu } from '../store/ActionCreator'


const mapStateToProps = state => {
    return {
        visible: state.getIn(['userCenter', 'loginModalStatu'])
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        toLoginPage: () => dispatch(changeLoginModalStatu(false))
    }
}


@connect(mapStateToProps,mapDispatchToProps)
class GuideToLogin extends Component {

    handleOk = () => {
        let {history,toLoginPage,location} = this.props;

        toLoginPage()

        history.replace({
            pathname: '/account/login',
            state:{
                whereTogo:location.pathname // 记录当前的pathname
            }
        })
    }
    
    render() {
        let {visible} = this.props

        return  (
            <Modal
                title={<span style={{fontSize:'20px'}}>未登录账号</span>}
                visible={visible}
                zIndex={1001}
                closable={false}
                centered={true}
                maskClosable={false}
                footer={
                    <Button key="submit" type="primary"  onClick={this.handleOk}>
                        确定  
                    </Button>
                }
            >
                <p style={{fontSize:"18px",textAlign:'center'}}><Icon type="frown" theme="twoTone" twoToneColor="rgb(184, 81, 22)" /><span style={{marginLeft:'12px'}}>请先登录账号</span></p>
            </Modal>
        )
    }
}

export default withRouter(GuideToLogin)








