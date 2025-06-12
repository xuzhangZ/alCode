
import 'braft-editor/dist/index.css';
import React from 'react';
import BraftEditor from 'braft-editor';
import { Modal, Button } from 'antd';
import * as commonUtil from '@/utils/common';
import styles from '@/components/CommonRichEditor.less';
const { confirm } = Modal;
export default class CommonRichEditor extends React.Component {
  constructor(props) {
    super(props);
    let initHtmlStr = commonUtil.escape2Html(props.initValue);
    let initState = BraftEditor.createEditorState(initHtmlStr);
    this.state = {
      editorState: initState,
      outputHTML: initHtmlStr,
      editorEnabled: props.editorEnabled ? props.editorEnabled : false,
      initEditorState: initState,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.initValue !== nextProps.initValue) {
      let initHtmlStr = commonUtil.escape2Html(nextProps.initValue);
      let initState = BraftEditor.createEditorState(initHtmlStr);
      this.setState({
        editorState: initState,
        outputHTML: initHtmlStr,
        initEditorState: initState,
      });
    }
  }

  handleChange = value => {
    this.setState({
      editorState: value,
    });
    if (this.props.onChange) {
      let outputHTML = value.toHTML();
      this.props.onChange(outputHTML);
    }
  };

  enableEditor = () => {
    this.setState({
      editorEnabled: true,
    });
  };

  cancelEditor = () => {
    let that = this;
    let outputHTML = this.state.editorState.toHTML();
    let initStr = commonUtil.escape2Html(this.props.initValue);
    if (outputHTML === initStr) {
      that.setState({
        editorEnabled: false,
      });
      return;
    } else {
      confirm({
        title: '提示',
        content: '确定放弃编辑的内容?',
        okText: '确定放弃',
        okType: 'danger',
        cancelText: '手抖了,我再想想',
        onOk() {
          let initEditorState = that.state.initEditorState;
          that.setState({
            editorState: initEditorState,
            editorEnabled: false,
          });
        },
        onCancel() {},
      });
    }
  };

  saveEditor = () => {
    let outputHTML = this.state.editorState.toHTML();
    this.props.onSave(outputHTML);
    this.setState({
      editorEnabled: false,
      outputHTML,
    });
  };

  render() {
    const { editable, editorHeight, contentHeight, hasBorder, onSave, containerWidth } = this.props;
    const { editorState, outputHTML } = this.state;
    let containerStyle = { marginBottom: 10 };
    if (containerWidth) {
      containerStyle.width = containerWidth;
    }
    if (hasBorder) {
      containerStyle = { ...containerStyle, borderRadius: 4, border: '1px solid rgb(212,212,212)' };
    }
    if (this.state.editorEnabled) {
      return (
        <div style={containerStyle}>
          <BraftEditor
            value={editorState}
            onChange={this.handleChange}
            style={{ height: editorHeight ? editorHeight : 500 }}
            contentStyle={{ height: contentHeight ? contentHeight : 400 }}
          />
          {onSave ? (
            <div
              style={{
                backgroundColor: 'rgb(233,233,233)',
                borderTop: '1px solid rgb(222,222,222)',
                textAlign: 'center',
                padding: 5,
              }}
            >
              <Button onClick={this.cancelEditor} style={{ marginRight: 10 }}>
                取消
              </Button>
              <Button type="primary" onClick={this.saveEditor}>
                保存
              </Button>
            </div>
          ) : (
            ''
          )}
        </div>
      );
    } else {
      let containerAttr = {};
      if (editable) {
        containerAttr = {
          className: styles.editorContainer,
          onClick: this.enableEditor,
          title: '点击修改',
        };
      }
      return <div {...containerAttr} dangerouslySetInnerHTML={{ __html: outputHTML }}></div>;
    }
  }
}
