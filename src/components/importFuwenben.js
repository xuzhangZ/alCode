import QuillDom from './quillDom';
export default props => {
    return (
        <>
            <QuillDom
                {...{
                    height: 300,
                    editorEnabled: true,
                    initValue: item.content?.replaceAll('\n', '<br/>'),
                    onSave: content => {
                        console.log(content, '______content');
                        sendJSONPostRequest(`/api/report/updateRichTextModuleContent`, {
                            reportId: id,
                            sequence: item.sequence,
                            content,
                        }).then(res => {
                            if (!res.success) {
                                message.error(res.errMessage);
                                return;
                            }
                        });
                    },
                }}
            />
            <CommonRichEditor
                {...{
                    containerWidth: '100%',
                    editorHeight: 400,
                    contentHeight: 300,
                    initValue:
                        item.content?.replaceAll('\n', '<br/>') || '<br/><br/><br/><br/>',
                    editable: true,
                    hasBorder: true,
                    editorEnabled: true,
                    onSave: content => {
                        sendJSONPostRequest(`/api/report/updateRichTextModuleContent`, {
                            reportId: id,
                            sequence: item.sequence,
                            content,
                        }).then(res => {
                            if (!res.success) {
                                message.error(res.errMessage);
                                return;
                            }
                        });
                    },
                }}
            />
        </>
    )




}