import React, { Component } from 'react'
import { Form, Icon, Input, Button } from 'antd';
import Header from '../../open/header/Header';
import { Link } from 'react-router-dom';
import VerificationCodeInput from '../../../components/verification-code-input/VerificationCodeInput';
import OutsideWrapper from '../../../components/outside-wrapper/OutsideWrapper'
import { Notification } from '../../../components/Notification';
import { post, get, Paths } from '../../../api';
import { encryption, getVcodeImgUrl } from '../../../util/util';

import IntroImg from '../../../assets/images/account/login-intro.png';

import './Login.scss'

class LoginForm extends React.Component {
	state = {
		showVerifyCode: false,
		vcodeImageUrl: getVcodeImgUrl(),
		instanceIdSeted: false,
		menuListSeted: false,

	}
	readyGoIn = () => {
		let { instanceIdSeted, menuListSeted } = this.state;
		if (instanceIdSeted && menuListSeted) {
			window.location = window.location.origin + window.location.pathname + '#/open';
		}
	}


	handleSubmit = e => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let _values = { ...values };
				//   {history} = this.props,
				//   {location} = history,
				//   pathname = '/open';

				//  不再使用引导框记录的原路由--- 主账号，不同子账号 可访问的路由都不一样，容易出现问题
				//   if (location && location.state && location.state.whereTogo) {
				//     pathname = location.state.whereTogo
				//   }

				// 对密码进行加密
				_values.password = encryption(_values.password)
				post(Paths.loginCheck, _values, {
					loading: true
				}).then(data => {

					get(Paths.getCaseList).then((res) => {//获取实例列表
						if (res.code == 0) {
							let datali = res.data || [];
							if (datali.length > 0) {
								let defaultInstanceId = datali[0].id;
								for (let i = 0; i < datali.length; i++) {
									if (datali[i].type == 0) {
										defaultInstanceId = datali[i].id;
										break
									}
								}
								localStorage.setItem('superInstanceId', defaultInstanceId);
								this.setState({ instanceIdSeted: true }, () => {
									this.readyGoIn();
								})
							} else {
								Notification({ type: 'warn', description: '没有实例！' });
							}

						}
					});
					get(Paths.getGroupMenuList, { version: 1.1 }, { loading: true }).then((res) => { //获取权限菜单
						if (res.code == 0) {

							localStorage.setItem('menuList', JSON.stringify(res.data));
							this.setState({ menuListSeted: true }, () => {
								this.readyGoIn();
							})

							// history.replace({
							//   pathname
							// })
						}
					});
				}).catch(error => {
					let { needVeriCode } = error,
						{ showVerifyCode } = this.state;

					if (needVeriCode) {
						if (!showVerifyCode) {
							this.setState({
								showVerifyCode: true
							})
						} else {
							this.setState({
								vcodeImageUrl: getVcodeImgUrl()
							})
						}
					}
				})
			}
		});
	};

	refreshVeriCode = () => {
		this.setState({
			vcodeImageUrl: getVcodeImgUrl()
		})
	}

	render() {
		const { getFieldDecorator } = this.props.form,
			{ showVerifyCode, vcodeImageUrl } = this.state;

		return (
			<Form className="login-form" onSubmit={this.handleSubmit}>
				<Form.Item>
					{getFieldDecorator('username', {
						rules: [{ required: true, message: '请输入用户名' }],
					})(
						<Input
							prefix={<Icon type="user" />}
							placeholder="请输入用户名"
						/>,
					)}
				</Form.Item>
				<Form.Item>
					{getFieldDecorator('password', {
						rules: [{ required: true, message: '请输入密码' }],
					})(
						<Input.Password
							prefix={<Icon type="lock" />}
							placeholder="请输入密码"
						/>,
					)}
				</Form.Item>
				{
					showVerifyCode &&
					<VerificationCodeInput getFieldDecorator={getFieldDecorator}
						imgSrc={vcodeImageUrl}
						refreshVeriCode={this.refreshVeriCode}
					></VerificationCodeInput>
				}
				<Form.Item className="login-form-button">
					<Button type="primary" htmlType="submit">
						登 录
					</Button>
				</Form.Item>
			</Form>
		);
	}
}

const WrappedLoginForm = Form.create({ name: 'normal_login' },)(LoginForm);

export default function Login({
	history
}) {
	return (
		<OutsideWrapper>
			<Header onlyLogo={true}></Header>
			<div className="content-wrapper in-login">
				<section className="login-content-wrapper flex-row">
					<section className="left-intro">
						<div className="left-content">
							<div className="intro-title">
								C-Life物联网云平台
							</div>
							<div className="intro-content">
								深度融合物联网，人工智能，大数据技术，深耕多种行业场景，助力企业数据价值挖掘，创造未来智慧生活。
							</div>
							<div className="intro-img-wrapper">
								<img src={IntroImg} alt="介绍图片" />
							</div>
						</div>
					</section>
					<section className="login-wrapper">
						<div className="login-content">
							<div className="login-title" style={{ position: "relative" }}>
								使用C-Life云帐号登录
							</div>
							<WrappedLoginForm history={history}></WrappedLoginForm>
							<div className="login-other">
								<span>还没有帐号? <Link to="/account/register">免费注册</Link></span>
								<span style={{ float: 'right' }}><Link to="/account/forgtopassword">忘记密码</Link></span>
							</div>
						</div>
					</section>
				</section>
			</div>
		</OutsideWrapper>
	)
}


