import reducer from "../store/reducer";

/* redux的state类型 */
export type AppState = ReturnType<typeof reducer>;

export interface formType {
  getFieldDecorator: Function; //用于和表单进行双向绑定，详见下方描述
  getFieldError: Function; //获取某个输入控件的 Error
  getFieldsError: Function; //	获取一组输入控件的 Error ，如不传入参数，则获取全部组件的 Error
  getFieldsValue: Function; //	获取一组输入控件的值，如不传入参数，则获取全部组件的值
  getFieldValue: Function; //	获取一个输入控件的值
  isFieldsTouched: Function; //	判断是否任一输入控件经历过 getFieldDecorator 的值收集时机
  isFieldTouched: Function; //	判断一个输入控件是否经历过 getFieldDecorator 的值收集时机
  isFieldValidating: Function; //	判断一个输入控件是否在校验状态	Function(name)
  resetFields: Function; //	重置一组输入控件的值（为 initialValue）与状态，如不传入参数，则重置所有组件
  setFields: Function; //	设置一组输入控件的值与错误状态：代码
  setFieldsValue: Function; //	设置一组输入控件的值（注意：不要在 componentWillReceiveProps 内使用，否则会导致死循环，原因）
  validateFields: Function; //校验并获取一组输入域的值与 Error，若 fieldNames 参数为空，则校验全部组件
  validateFieldsAndScroll: Function; // 与 validateFields 相似，但校验完后，如果校验不通过的菜单域不在可见范围内，则自动滚动进可见范围
}

export interface actionProps {
  type: string;
  [data: string]: any;
}
