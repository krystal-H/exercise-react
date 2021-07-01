import React, { Component } from 'react'
import { Form, Input, Button, Select, DatePicker, Table } from 'antd'

import PageTitle from '../../../components/page-title/PageTitle';
import AloneSection from '../../../components/alone-section/AloneSection';
import moment from 'moment';

import './OperateLog.scss'
import { DateTool, addKeyToTableData } from '../../../util/util';
import { Paths, get } from '../../../api';

const { RangePicker } = DatePicker;
const { Option } = Select;
const dateFormat = 'YYYY/MM/DD';
const defaultPageRows = 20;

class SearchForm extends Component {
    handleSubmit = e => {
        e.preventDefault();

        let {form,searchLog} = this.props;

        form.validateFields((err, values) => {
          if (!err) {
				let {time = [],userName,type,theme} = values,
					[startTime = '',endTime = ''] = time;

				if (startTime) {
					startTime = (startTime.hour(0).minute(0).second(0).millisecond(0).unix() - 8 * 3600) * 1000;
				}
				if (endTime) {
					endTime = (endTime.hour(0).minute(0).second(0).millisecond(0).unix() - 8 * 3600) * 1000;
				}
				searchLog({
					userName,
					type,
					theme,
					startTime,
					endTime
				})
          	}
        });
	}

	disabledDate = (current) => {
		// 可选范围为向前180天
		return current && ((current > moment().endOf('day')) || (current < moment().add(-180,'d').endOf('day')));
	  }
	
	reset = () => {
		let {form} = this.props;
		
		form.resetFields()
	}
    render () {
		let {form} = this.props,
            {getFieldDecorator} = form;

        return (
			<Form layout="inline" onSubmit={this.handleSubmit}>
				<div className='searchCriteria limit-label'>
					<Form.Item label="操作人" >
						{getFieldDecorator('userName', {
							rules: [],
							initialValue: ''
						})(<Input style={{ width: '220px' }} placeholder="请输入操作人" />)}
					</Form.Item>
					<Form.Item label="操作分类" >
						{getFieldDecorator('type', {
							rules: [],
							initialValue: ''
						})(<Select  style={{ width: '220px' }}>
							<Option value="">请选择</Option>
							<Option value="0">基本操作</Option>
							<Option value="1">产品操作</Option>
							<Option value="2">数据订阅</Option>
							<Option value="3">应用管理</Option>
							<Option value="4">设备管理</Option>
							<Option value="5">固件管理</Option>
							<Option value="6">调试工具</Option>
						</Select>)}	
					</Form.Item>
					<Form.Item label="对象" >
						{getFieldDecorator('theme', {
							rules: [],
							initialValue: ''
						})(<Input style={{ width: '220px' }} placeholder="请输入操作对象" />)}		
					</Form.Item>
					<Form.Item label="时间">
						{getFieldDecorator('time', {
							rules: []
						})(<RangePicker
                            style={{ width: '220px' }}
							disabledDate={this.disabledDate}	
							format={dateFormat} />)}
					</Form.Item>
				</div>
				<div className='searchBut'>
					<Form.Item>
						<Button style={{ marginRight: '12px' }}
								htmlType="submit"
								type="primary">查询</Button>
						<Button onClick={this.reset}
								type="default">重置</Button>
					</Form.Item>
				</div>
            </Form>
        )
    }
}

const SearchFormWrapper = Form.create({name:'search-form'})(SearchForm)

export default class VisitLog extends Component {
	state = {
		logsList:[],
		pager:{},
		pageIndex: 1,
		conditions:{
			userName:'',
			type:'',
			theme:'',
			startTime:'',
			endTime:''
		}
	}
	constructor(props) {
		super(props)
		this.columns = [
			// {
			// 	title: 'Id',
			// 	dataIndex: 'logId',
			// 	width:'100px',
			// },
			{
				title: '操作人',
				dataIndex: 'userName',
				width:'250px',
			},
			{
				title: '操作',
				dataIndex: 'content',
				width:'200px',
				render: (text, record) => {
					let { content, description } = record;
					return <span>{description || content || '未识别内容'}</span>
				}
			},
			{
				title: '对象',
				dataIndex: 'theme'
			},
			{
				title: '时间',
				width:'200px',
				dataIndex: 'createTime',
				render: (text, record) => {
					let { createTime } = record;
					return <span>{DateTool.utcToDev(+createTime)}</span>
				}
			},
		];
	}
	componentDidMount(){
		this.getLogsList()
	}
	getLogsList() {
		let {conditions,pageIndex} = this.state,
			_data = {};

		Object.keys(conditions).forEach(item => {
			if(conditions[item]) {
				_data[item] = conditions[item]
			}
		})

		get(Paths.getOperateLogList,{
			..._data,
			pageIndex,
			pageRows:defaultPageRows
		},{
			loading:true,
			needVersion:1.1
		}).then(data => {
			let {list,pager} = data.data || {};
			
			this.setState({
				logsList:addKeyToTableData(list),
				pager
			})
		})
	}
	searchLog =  (conditions) => {
		this.setState({ 
			conditions, // 需要存放在state中，因为切换pageIndex时也需要用到
			pageIndex:1 // 重置pageIndex
		},() => {
			this.getLogsList()
		})
	}
	changePage = (pageIndex) => {
		this.setState({
			pageIndex
		},() => {
			this.getLogsList()
		})
	}
	render() {
		let {logsList,pager,pageIndex} = this.state;

		return (
			<div>
				<div>
					<PageTitle noback={true} title="操作日志"></PageTitle>

				</div>
				<AloneSection title="">
					<div className="search-area lineSearchBox">
						<SearchFormWrapper searchLog={this.searchLog}></SearchFormWrapper>
					</div>
					<div style={{ marginTop: '24px', padding: '12px 24px' }}>
						<Table columns={this.columns}
							   pagination={{
									total:pager.totalRows,
									current:pageIndex,
									defaultCurrent:1,
									defaultPageSize:defaultPageRows,
									onChange:(page) => this.changePage(page),
									showTotal:total => <span>共 <a>{total}</a> 条</span>,
									showQuickJumper:true,
									hideOnSinglePage:true
								}} 
							   dataSource={logsList} />
					</div>
				</AloneSection>
			</div>
		)
	}
}
