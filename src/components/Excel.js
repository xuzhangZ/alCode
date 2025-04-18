import * as XLSX from 'xlsx';

export const exportToExcel = (headers, data, fileName = 'demo.xlsx') => {
  // eslint-disable-next-line no-underscore-dangle
  const _headers = headers
    .map((item, i) => ({
      key: item.key,
      title: item.title,
      position: String.fromCharCode(65 + i) + 1,
    }))
    .reduce(
      (prev, next) => ({
        ...prev,
        [next.position]: { key: next.key, v: next.title },
      }),
      {},
    );
  // eslint-disable-next-line no-underscore-dangle
  const _data = data
    .map((item, i) =>
      headers.map((key, j) => ({
        content: item[key.key],
        position: String.fromCharCode(65 + j) + (i + 2),
      })),
    )
    // 对刚才的结果进行降维处理（二维数组变成一维数组）
    .reduce((prev, next) => prev.concat(next))
    // 转换成 worksheet 需要的结构
    .reduce((prev, next) => ({ ...prev, [next.position]: { v: next.content } }), {});

  // 合并 headers 和 data
  console.log(data);
  const output = { ..._headers, ..._data };
  // 获取所有单元格的位置
  const outputPos = Object.keys(output);
  // 计算出范围 ,["A1",..., "H2"]
  const ref = `${outputPos[0]}:${outputPos[outputPos.length - 1]}`;

  // 构建 workbook 对象
  const wb = {
    SheetNames: ['mySheet'],
    Sheets: {
      mySheet: {
        ...output,
        '!ref': ref,
        '!cols': [
          { wpx: 200 }, // 配置列宽
          { wpx: 300 },
          { wpx: 400 },
          { wpx: 300 },
          { wpx: 350 },
          { wpx: 100 },
          { wpx: 300 },
          { wpx: 300 },
        ],
      },
    },
  };
  // 导出 Excel
  XLSX.writeFile(wb, fileName);
};
//调用
const handleExcelExport = (data, columns) => {
    message.info('正在导出');
    if (data === undefined || data.length === 0) {
      return;
    }
    const header = columns.filter((col) => {
      return col.export;
    });
    const exportData = JSON.parse(JSON.stringify(data));
    const fileName = '节目列表.xlsx';
    exportToExcel(header, exportData, fileName);
  };