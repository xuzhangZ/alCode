import React, { useState, useRef, useEffect } from 'react';
import {
  actionTypes,
  Content,
  createBiPlugins,
  locale_zh_CN,
  Provider,
  Toolbar,
  ToolbarMode,
  locale_zh_CN as locale,
} from '@ali/4ever-bi';
import { Modal, Button } from 'antd';
import { Base64 } from 'js-base64';
import { Serializer as Mo } from '@ali/4ever-mo';
import styles from '../Bug/index.less';
import * as commonUtil from '@/utils/common';
import { EmbedPlugin as BambooEmbedPlugin } from '@ali/4ever-bamboo';
import { sendAtoolsJSONPostRequest } from '../Bug/AtoolsRequest';
import axios from 'axios';
const { confirm } = Modal;

export function getMsgId(len) {
  const text = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const rdmIndex = str => (Math.random() * str.length) | 0;
  let rdmString = '';
  for (; rdmString.length < len; rdmString += text.charAt(rdmIndex(text)));
  return rdmString;
}

export default props => {
  const { initValue, height, onSave } = props;
  const mo = Mo();
  let asl = ['root'];
  const [values, setValues] = useState(mo.jsonMLToValue(asl));
  const [editorEnabled, seteditorEnabled] = useState(
    props.editorEnabled ? props.editorEnabled : false,
  );
  const initData = useRef(null);
  const { getFileTypeForRead, FileTypeMap } = BambooEmbedPlugin;

  function selectFile(acceptTypes) {
    const promise = new Promise(resolve => {
      const fileInput = document.createElement('input');
      fileInput.setAttribute('type', 'file');
      fileInput.setAttribute('multiple', 'true');
      fileInput.setAttribute('accept', acceptTypes || '*');
      fileInput.click();
      fileInput.onchange = () => {
        const { files } = fileInput;
        resolve(Array.from(files));
      };
    });
    return promise;
  }
  useEffect(() => {
    if (initValue) {
      setValues(mo.htmlToValue(commonUtil.escape2Html(initValue)));
    }
  }, [initValue]);

  const handleUploadVideo = async (file, id, notifyProgress) => {
    const notify = (percent, delay) => {
      setTimeout(() => {
        notifyProgress(percent);
      }, delay);
    };
    notify(20, 100);
    notify(50, 500);
    notify(100, 1100);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(
        'https://d.abird.alibaba-inc.com/api/commit_test/oss/fileCommonUpload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return new Promise(resolve => {
        setTimeout(() => resolve({ url: response.data.data }), 2500);
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleAction = (action, controller, next) => {
    const { type } = action;
    if (type === actionTypes.FILE_SELECT) {
      return selectFile('.log' && '.txt').then(files => {
        return controller.command('insertEmbed', files);
      });
    }
    if (type === actionTypes.VIDEO_SELECT) {
      // 选择一个本地的 video 文件
      return selectFile('.mp4').then(file => {
        return controller.command('insertVideo', file);
      });
    }
    if (type === actionTypes.IMAGE_SELECT) {
      // 选择一个本地的 image 文件
      return selectFile('image/*').then(file => {
        return controller.command('insertImageFile', file);
      });
    }
    return next();
  };
  const handleChange = change => {
    setValues(change.value);
  };

  const config = [
    {
      toolButtons: [
        {
          name: 'heading',
          hideTargets: ['listSymbol'],
        },
        {
          name: 'sz',
        },
        
      ],
    },
    {
      toolButtons: [
        {
          name: 'bold',
        },
        {
          name: 'italic',
        },
        {
          name: 'strike',
          hideTargets: ['listSymbol'],
        },
        {
          name: 'underline',
          hideTargets: ['listSymbol'],
        },
        {
          name: 'color',
        },
        {
          name: 'highlight',
        },
      ],
    },
    {
      toolButtons: [
        {
          name: 'table.fill',
        },
        {
          name: 'table.border',
        },
        {
          name: 'table.merge',
        },
        {
          name: 'table.vAlign',
        },
      ],
      showTargets: ['table'],
    },
    {
      toolButtons: [
        {
          name: 'list.ulist',
        },
        {
          name: 'list.olist',
        },
        {
          name: 'list.tlist',
          hideTargets: ['listSymbol'],
        },
      ],
    },
    {
      toolButtons: [
        {
          name: 'sticker',
          hideTargets: ['listSymbol'],
        },
        {
          name: 'image',
          hideTargets: ['listSymbol'],
        },
        {
          name: 'video',
          hideTargets: ['listSymbol'],
        },
        {
          name: 'table.picker',
          hideTargets: ['table', 'listSymbol'],
        },
      ],
    },
  ];
  const createFireProgress = notifyProgress => {
    return (percent, delay) => {
      setTimeout(() => {
        notifyProgress(percent);
      }, delay);
    };
  };
  const handleUploadFile = (file, id, notifyProgress) => {
    const fire = createFireProgress(notifyProgress);
    fire(20, 200);
    fire(50, 1000);
    fire(80, 1600);
    fire(100, 2200);
    return new Promise((resolve, reject) => {
      const type = getFileTypeForRead(file.name);
      if (
        file.size > 200 * 1000 * 1000 &&
        (type === FileTypeMap.Word ||
          type === FileTypeMap.Excel ||
          type === FileTypeMap.Ppt ||
          type === FileTypeMap.Pdf)
      ) {
        alert('文件太大，有可能预览失败');
      }
      if (file.size > 200 * 1024 * 1024) {
        reject(new Error('oversize_error'));
        return;
      }

      var isImg = (file && 1) || -1;
      var reader = new FileReader();
      if (isImg >= 0) {
        //将文件读取为 DataURL
        reader.readAsDataURL(file);
      }
      let editorList = [];
      reader.onload = function(event) {
        sendAtoolsJSONPostRequest(
          'https://d.abird.alibaba-inc.com/api/commit_test/oss/base64Upload',
          {
            fileName: getMsgId(8) + file.name,
            base64Info: event.target.result,
          },
        ).then(res => {
          editorList.push([
            'p',
            [
              'a',
              {
                href: `${res.data}`,
              },
              [
                'span',
                {
                  'data-type': 'text',
                },
                [
                  'span',
                  {
                    'data-type': 'leaf',
                  },
                  `点击下载日志附件：${file.name}`,
                ],
              ],
            ],
          ]);
        });
      };
    });
  };

  const handlePreviewFile = url => {
    console.log('bbb');
  };

  const plugins = createBiPlugins({
    ...locale_zh_CN,
    basic: {
      serializer: mo,
    },
    image: {
      locale: locale_zh_CN.link.locale,
      shouldTransferImageURL: () => true,
      uploadImage: async (file, id, notifyProgress) => {
        const notify = (percent, delay) => {
          setTimeout(() => {
            notifyProgress(percent);
          }, delay);
        };
        notify(20, 100);
        notify(50, 500);
        notify(100, 1100);
        const formData = new FormData();
        formData.append('file', file);
        try {
          const response = await axios.post(
            'https://d.abird.alibaba-inc.com/api/commit_test/oss/fileCommonUpload',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            },
          );
          return new Promise(resolve => {
            setTimeout(() => resolve({ url: response.data.data }), 2500);
          });
        } catch (error) {
          console.log(error);
        }
      },
    },
    embed: {
      ...locale.embed,
      transformDocURL: url => handlePreviewFile(url),
      enableFilePreview: true,
      uploadFile: (file, id, notifyProgress) => handleUploadFile(file, id, notifyProgress),
      allowDownload: src => {
        return new Promise(r => {
          setTimeout(() => {
            r(true);
          }, 2000);
        });
      },
    },
    video: {
      allowDownload: true,
      downloadFile: () => {},
      uploadFile: handleUploadVideo,
    },
    draggable: {
      ...locale_zh_CN.draggable,
      enabled: true,
    },
    clipboard: {
      serializer: mo,
    },
  });

  const style = {
    height: height,
    overflowX: 'hidden',
    padding: '16px',
    border: '1px solid #e8e8e8',
    borderLeft: '1px solid #e8e8e8',
    borderRight: '1px solid #e8e8e8',
    color: '#404040',
    background: '#fff',
    fontSize: '11pt',
    WebkitFontSmoothing: 'antialiased',
    fontFamily:
      '-apple-system, "PingFang SC", "Segoe UI", "Microsoft YaHei", "STHeiti", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji"',
  };
  return (
    <div style={{ height: '100%' }}>
      {editorEnabled ? (
        <Provider plugins={plugins} value={values} onChange={handleChange} onAction={handleAction}>
          <Toolbar toolbarMode={ToolbarMode.single} singleLayout={config} />
          <Content placeholder="尝试在这里粘贴图片 + 文字" style={style} className={styles.size} />
          <div
            style={{
              backgroundColor: 'rgb(233,233,233)',
              borderTop: '1px solid rgb(222,222,222)',
              textAlign: 'center',
              padding: 5,
            }}
          >
            <Button
              style={{ marginRight: 10 }}
              onClick={() => {
                confirm({
                  title: '提示',
                  content: '确定放弃编辑的内容?',
                  okText: '确定放弃',
                  okType: 'danger',
                  cancelText: '手抖了,我再想想',
                  onOk() {
                    setValues(mo.htmlToValue(commonUtil.escape2Html(initValue)));
                    seteditorEnabled(false);
                  },
                  onCancel() {},
                });
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={() => {
                const description = encodeURIComponent(
                  Base64.encode(
                    mo
                      .valueToHTML(values)
                      .replaceAll(
                        '<video',
                        '<video style="background: #000;width: 100%;height: 400px;border-radius: 8px;"',
                      )
                      .replaceAll('<img', '<img width="50%"')
                      .replaceAll(
                        '>点击下载日志附件：',
                        ' style="display: block;background: #097bed;min-height: 40px;color: #fff;margin: 16px 0px;border-radius: 8px;font-size: 16px;text-align: center;display: flex;align-items: center;justify-content: center;">点击下载日志附件：',
                      ),
                  ),
                );
                initData.current = Base64.decode(decodeURIComponent(description));
                onSave(Base64.decode(decodeURIComponent(description)));
                seteditorEnabled(false);
              }}
            >
              保存
            </Button>
          </div>
        </Provider>
      ) : (
        <div
          onClick={() => {
            seteditorEnabled(true);
          }}
          className={styles.editorContainer}
          title="点击修改"
          dangerouslySetInnerHTML={{
            __html: commonUtil.escape2Html(initData.current || initValue),
          }}
        ></div>
      )}
    </div>
  );
};
