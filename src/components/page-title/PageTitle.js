import React from 'react'
import {Icon,Button} from 'antd'
import { withRouter} from 'react-router-dom'

import './PageTitle.scss'


function PageTitle({noback,
                    backHandle,
                    title,
                    needBtn,
                    btnText = '新建',
                    btnStyle = 'primary',
                    btnClickHandle,
                    btnLoading,
                    btnIcon = null,
                    history}) {

    const defaultGoback = () => history.goBack()

    return (
        <div className="page-title">
            {
                !noback && 
                <span className="back" onClick={backHandle || defaultGoback}><Icon type="arrow-left" /></span>
            }
            <span className="title">{title}</span>

            {
                needBtn && 
                <span className="op-areas">
                        <Button type={btnStyle} 
                                onClick={btnClickHandle} 
                                loading={btnLoading} 
                                icon={btnIcon}>
                            {
                                btnText
                            }
                        </Button>
                </span>
            }
        </div>
    )
}

export default withRouter(React.memo(PageTitle))
