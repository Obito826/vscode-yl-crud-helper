export default {
  ref: { description: '组件 ref，默认为 params' },
  data: { description: '表格数据' },
  option: { description: 'crud 配置项' },
  page: { description: '页码配置项' },
  "table-loading": { description: '表格 loading' },
  'custom-add': { type: 'method', description: '自定义新增方法' },
  'custom-edit': { type: 'method', description: '自定义编辑方法' },
  'row-save': { type: 'method', description: '行新增方法' },
  'row-update': { type: 'method', description: '行编辑方法' },
  'size-change': { type: 'method', description: '页码大小改变方法' },
  'current-change': { type: 'method', description: '翻页方法' },
  'search-reset': { type: 'method', description: '搜索条件重置' },
  'search-change': { type: 'method', description: '搜索方法' },
  'selection-change': { type: 'method', description: '表格勾选项改变方法' },
  'row-del': { type: 'method', description: '行删除方法' }
};
