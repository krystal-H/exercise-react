import React from 'react';
import { Select, Carousel, Icon } from 'antd';
import { connect } from 'react-redux';
import ModuleItem from './ModuleItem';

const Option = Select.Option;

class ModuleSelect extends React.Component{
    state = {
        moduleBrandId: 0
    }

    handleChange = (id) => {
        this.setState({
            moduleBrandId: id
        })
    }

    render(){
        const { moduleList } = this.props;
        const { moduleBrandId } = this.state;
        let list = [];
        if(!moduleBrandId){
            list = moduleList.reduce((x, y) => x.concat(y.moduleList), []);
        }else{
            list = moduleList.find(item => item.moduleBrandId === moduleBrandId).moduleList;
        }

        return (
            <div className="hardware-detail-content">
                    <div className="hardware-module-title">
                        <span className="module-title">请选择通信模组</span>
                        <Select placeholder="请选择厂商" className="module-select" value={moduleBrandId} onChange={this.handleChange}>
                            <Option key="0" value={0}>全部厂商</Option>
                            {
                                moduleList && moduleList.length 
                                ? moduleList.map(item => (
                                    <Option key={item.moduleBrandId} value={item.moduleBrandId}>{item.brandName}</Option>
                                ))
                                : null
                            }
                        </Select>
                    </div>
                    <div className="hardware-module-swiper">
                        <Carousel slidesToShow={list.length < 4 ? list.length : 4 } slidesToScroll={4} speed={1000} ref={ref => this.carousel = ref} autoplay={false}>
                            {
                                list && list.length ? list.map((item, index) => (
                                   <ModuleItem moduleItem={item} key={index} />
                                ))
                                : null
                            }
                        </Carousel>
                        {
                            list.length > 4 &&
                            <>
                                <Icon type="left" className="btn-left" onClick={() => this.carousel.prev()}></Icon>
                                <Icon type="right" className="btn-right" onClick={() => this.carousel.next()}></Icon>
                            </>
                        }
                    </div>
                </div>
        )
    }
}

const mapStateToProps = (state) => ({
    moduleList: state.getIn(['product', 'moduleList']).toJS(),
    moduleItem: state.getIn(['product', 'moduleItem']).toJS(),

});

const mapDispatchToProps = (dispatch) => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(ModuleSelect)