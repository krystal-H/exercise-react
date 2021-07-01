import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actionCreators } from '../store';
import PageTitle from '../../../../components/page-title/PageTitle';

import './style.scss'

@withRouter
class CustomMethodDetail extends PureComponent {

    componentDidMount = () => {
        // 动态路由的id从this.props.match.params里拿
        console.log('this.props.match.params', this.props.match.params);
        const apiId = this.props.match.params.apiId;
        this.props.getCurApi(apiId);
    };

    ruleType = (type) => {
        if (type === 1) {
            return (
                <span>取平均值：y=（a<sub>1</sub>+a<sub>2</sub>+...+a<sub>n</sub>）/n</span>
            );
        } else if (type === 2) {
            return (
                <span>取和：y= a<sub>n</sub>+a<sub>（n-1）</sub></span>
            );
        }
        else if (type === 3) {
            return (
                <span>取最大值：y=a<sub>max</sub></span>
            );
        }
        else if (type === 4) {
            return (
                <span>取最小值：y=a<sub>min</sub></span>
            );
        } else {
            return (
                <span>加载中...</span>
            );
        }
    };

    render() {
        let { curApi } = this.props;
        let dataTypeName = '';
        let reportFormsTypeName = '';
        switch (curApi.get('dataType')) {
            case 3:
                dataTypeName = '运行数据';
                break;
            case 8:
                dataTypeName = '历史运行';
                break;
            case 20:
                dataTypeName = '历史控制';
                break;
            case 27:
                dataTypeName = '状态数据';
                break;
            default:
                break;
        }
        switch (curApi.get('reportFormsType')) {
            case 1:
                reportFormsTypeName = '1年';
                break;
            case 2:
                reportFormsTypeName = '1月';
                break;
            case 3:
                reportFormsTypeName = '1天';
                break;
            case 4:
                reportFormsTypeName = '1小时';
                break;
            default:
                break;
        }

        return (
            <div className="detail-method-wrapper">
                <PageTitle backHandle={() => this.props.history.goBack()} title="自定义统计方法/查看" />
                <div className="detail-content-wrapper">
                    <div className="detail-content">
                        <ul>
                            <li>
                                <span className="key">统计名称：</span>
                                <span className="value">{curApi.get('apiName')}</span>
                            </li>
                            <li>
                                <span className="key">产品名称：</span>
                                <span className="value">{curApi.get('productName')}</span>
                            </li>
                            <li>
                                <span className="key">{dataTypeName}：</span>
                                <span className="value">{`${curApi.get('propertyName') || ''}-${curApi.get('property')}`}</span>
                            </li>
                            <li>
                                <span className="key">统计精度：</span>
                                <span className="value">{reportFormsTypeName}</span>
                            </li>
                            <li>
                                <span className="key">时区：</span>
                                <span
                                    className="value">{curApi.get('cityTimeZone') ? curApi.get('cityTimeZone') : '北京'}</span>
                            </li>
                            <li>
                                <span className="key">计算规则：</span>
                                <span className="value">{this.ruleType(curApi.get('ruleType'))}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

const mapState = (state) => ({
    curApi: state.getIn(['customMethod', 'curApi']),
});

const mapDispatch = (dispatch) => {
    return {
        getCurApi(apiId) {
            const action = actionCreators.getCurApi(apiId);
            dispatch(action);
        },
    }
};

export default connect(mapState, mapDispatch)(CustomMethodDetail);
