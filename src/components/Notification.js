import React from 'react';
import { notification} from 'antd';

/**
 * 公共提示
 * @param {*} title 提示标题
 * @param {*} str 提示内容
 * @param {*} showTime 显示时长
 * @param {string} type 提示类型 ['success','info','warn','error'] 其中的一种
 */
export function Notification ({message,description,type = 'warn',...rest}) {
	if(!['success','info','warn','error'].includes(type)) {
		console.log('请传入正确的type: 要求为 success, info, warn ,error 中的一种！')
		return;
	}

	// 销毁已有提示框
	notification.destroy()

	notification[type]({
		message: message || '提示',
		description:description ||  '',
		duration: 2,
		...rest
	})
}