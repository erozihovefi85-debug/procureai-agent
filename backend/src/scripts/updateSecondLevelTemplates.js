/**
 * 完整的精准品类模板配置脚本
 * 基于二级品类的业务特点，为所有219个品类创建专属模板字段
 */

import mongoose from 'mongoose';
import ProcurementCategory from '../models/ProcurementCategory.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取品类数据
const categoriesData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../all-categories.json'), 'utf-8'));

// ============================================
// 所有二级品类的模板定义
// ============================================

const ALL_SECOND_LEVEL_TEMPLATES = {

  // ========== 不动产管理 ==========
  '办公室装修工程相关': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'RZ-001' },
      { key: '工程项目名称', label: '工程项目名称', required: true, width: 25, type: 'text' },
      { key: '工程地点', label: '工程地点', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '工程类型', label: '工程类型', required: true, width: 15, type: 'select', options: ['新建', '改造', '维修', '维护'] },
      { key: '工程范围', label: '工程范围', required: true, width: 40, type: 'textarea' },
      { key: '技术要求', label: '技术要求', required: false, width: 40, type: 'textarea' },
      { key: '材料品牌要求', label: '材料品牌要求', required: false, width: 25, type: 'text' },
      { key: '施工标准', label: '施工标准', required: false, width: 30, type: 'textarea' },
      { key: '工期要求', label: '工期要求', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '资质要求', label: '资质要求', required: false, width: 30, type: 'textarea' },
      { key: '安全要求', label: '安全要求', required: false, width: 30, type: 'textarea' },
      { key: '环保要求', label: '环保要求', required: false, width: 30, type: 'textarea' },
      { key: '验收标准', label: '验收标准', required: false, width: 30, type: 'textarea' },
      { key: '质保期', label: '质保期', required: false, width: 15, type: 'text' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '办公室建设相关顾问服务': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'AD-001' },
      { key: '咨询项目名称', label: '咨询项目名称', required: true, width: 25, type: 'text' },
      { key: '项目地址', label: '项目地址', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '咨询类型', label: '咨询类型', required: true, width: 15, type: 'select', options: ['声学设计', '光学设计', '造价咨询', '机电顾问', '项目管理', '前期顾问'] },
      { key: '咨询内容', label: '咨询内容', required: true, width: 40, type: 'textarea' },
      { key: '服务方式', label: '服务方式', required: false, width: 15, type: 'select', options: ['现场服务', '远程服务', '混合服务'] },
      { key: '服务周期', label: '服务周期', required: false, width: 15, type: 'text' },
      { key: '专家资质要求', label: '专家资质要求', required: false, width: 30, type: 'textarea' },
      { key: '交付成果', label: '交付成果', required: false, width: 35, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '租赁及物业管理相关': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'FY-001' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['办公室租赁', '车位租赁', '物业管理', '中介服务', '会议服务'] },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '位置要求', label: '位置要求', required: false, width: 25, type: 'text' },
      { key: '面积/数量要求', label: '面积/数量要求', required: false, width: 20, type: 'text' },
      { key: '服务期限', label: '服务期限', required: false, width: 15, type: 'text' },
      { key: '预算金额（元/月）', label: '预算金额（元/月）', required: false, width: 15, type: 'number' },
      { key: '配套设施要求', label: '配套设施要求', required: false, width: 30, type: 'textarea' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '办公室家具': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'JJ-001' },
      { key: '家具名称', label: '家具名称', required: true, width: 25, type: 'text' },
      { key: '家具类型', label: '家具类型', required: true, width: 15, type: 'select', options: ['系统家具', '休闲家具', '办公椅', '办公桌', '文件柜', '其他'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '数量', label: '数量', required: true, width: 10, type: 'number' },
      { key: '单位', label: '单位', required: true, width: 8, type: 'select', options: ['件', '套', '组', '批'] },
      { key: '规格尺寸', label: '规格尺寸', required: false, width: 25, type: 'text' },
      { key: '材质要求', label: '材质要求', required: false, width: 20, type: 'text' },
      { key: '颜色要求', label: '颜色要求', required: false, width: 15, type: 'text' },
      { key: '品牌要求', label: '品牌要求', required: false, width: 15, type: 'text' },
      { key: '预算单价（元）', label: '预算单价（元）', required: false, width: 15, type: 'number' },
      { key: '预算总价（元）', label: '预算总价（元）', required: false, width: 15, type: 'number' },
      { key: '交付日期', label: '交付日期', required: false, width: 15, type: 'date' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '办公室装饰工程相关': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'RZ-001' },
      { key: '项目名称', label: '项目名称', required: true, width: 25, type: 'text' },
      { key: '施工地址', label: '施工地址', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '装饰类型', label: '装饰类型', required: true, width: 15, type: 'select', options: ['软装', '窗帘', '灯具', '综合装饰'] },
      { key: '装饰范围', label: '装饰范围', required: true, width: 40, type: 'textarea' },
      { key: '设计风格', label: '设计风格', required: false, width: 20, type: 'text' },
      { key: '材料要求', label: '材料要求', required: false, width: 30, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '工期要求', label: '工期要求', required: false, width: 15, type: 'text' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '办公室安防系统工程及相关服务': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'AF-001' },
      { key: '项目名称', label: '项目名称', required: true, width: 25, type: 'text' },
      { key: '服务地点', label: '服务地点', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['安防系统建设', '安防系统维护', '保安服务', '安防咨询', 'SOS服务'] },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '人员/设备要求', label: '人员/设备要求', required: false, width: 30, type: 'textarea' },
      { key: '服务标准', label: '服务标准', required: false, width: 30, type: 'textarea' },
      { key: '服务期限', label: '服务期限', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '响应时间要求', label: '响应时间要求', required: false, width: 20, type: 'text' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // ========== 办公室设备及服务 ==========
  '饮料及食品': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'YP-001' },
      { key: '物品名称', label: '物品名称', required: true, width: 20, type: 'text' },
      { key: '物品类别', label: '物品类别', required: true, width: 12, type: 'select', options: ['饮料', '饮用水', '食品', '零食'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '品牌要求', label: '品牌要求', required: false, width: 15, type: 'text' },
      { key: '规格要求', label: '规格要求', required: false, width: 20, type: 'text' },
      { key: '数量', label: '数量', required: true, width: 10, type: 'number' },
      { key: '单位', label: '单位', required: true, width: 8, type: 'select', options: ['箱', '件', '瓶', '个', '包'] },
      { key: '配送频次', label: '配送频次', required: false, width: 15, type: 'select', options: ['每日', '每周', '每月', '按需'] },
      { key: '预算单价（元）', label: '预算单价（元）', required: false, width: 15, type: 'number' },
      { key: '预算总价（元）', label: '预算总价（元）', required: false, width: 15, type: 'number' },
      { key: '质量要求', label: '质量要求', required: false, width: 30, type: 'textarea' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '办公文具及设备': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'BG-001' },
      { key: '物品名称', label: '物品名称', required: true, width: 20, type: 'text' },
      { key: '物品类型', label: '物品类型', required: true, width: 15, type: 'select', options: ['办公设备', '办公文具', '硒鼓', '行政电器', '耗材'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '规格型号', label: '规格型号', required: false, width: 25, type: 'text' },
      { key: '数量', label: '数量', required: true, width: 10, type: 'number' },
      { key: '单位', label: '单位', required: true, width: 8, type: 'select', options: ['台', '个', '盒', '包', '套'] },
      { key: '品牌要求', label: '品牌要求', required: false, width: 15, type: 'text' },
      { key: '预算单价（元）', label: '预算单价（元）', required: false, width: 15, type: 'number' },
      { key: '预算总价（元）', label: '预算总价（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '物流快递': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'WL-001' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['快递服务', '物流服务', '搬运服务', '仓储服务', '文件管理'] },
      { key: '服务区域', label: '服务区域', required: true, width: 20, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '服务要求', label: '服务要求', required: true, width: 40, type: 'textarea' },
      { key: '预计业务量', label: '预计业务量', required: false, width: 15, type: 'text' },
      { key: '时效要求', label: '时效要求', required: false, width: 20, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '服务期限', label: '服务期限', required: false, width: 15, type: 'text' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '设施管理及维护/外包服务': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'SS-001' },
      { key: '服务项目名称', label: '服务项目名称', required: true, width: 25, type: 'text' },
      { key: '服务地点', label: '服务地点', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['保洁服务', '绿植租赁', '驻场外包', '维修维护', '改造工程'] },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '服务频次', label: '服务频次', required: false, width: 15, type: 'text' },
      { key: '服务标准', label: '服务标准', required: false, width: 30, type: 'textarea' },
      { key: '人员要求', label: '人员要求', required: false, width: 25, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '服务期限', label: '服务期限', required: false, width: 15, type: 'text' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '印刷品': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'YS-001' },
      { key: '印刷品名称', label: '印刷品名称', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '印刷类型', label: '印刷类型', required: true, width: 15, type: 'select', options: ['标准印刷', '数码印刷'] },
      { key: '规格要求', label: '规格要求', required: true, width: 30, type: 'textarea' },
      { key: '数量', label: '数量', required: true, width: 10, type: 'number' },
      { key: '单位', label: '单位', required: true, width: 8, type: 'select', options: ['份', '本', '盒', '张'] },
      { key: '材质要求', label: '材质要求', required: false, width: 20, type: 'text' },
      { key: '工艺要求', label: '工艺要求', required: false, width: 25, type: 'textarea' },
      { key: '预算单价（元）', label: '预算单价（元）', required: false, width: 15, type: 'number' },
      { key: '预算总价（元）', label: '预算总价（元）', required: false, width: 15, type: 'number' },
      { key: '交付日期', label: '交付日期', required: false, width: 15, type: 'date' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '公司会议': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'HY-001' },
      { key: '会议名称', label: '会议名称', required: true, width: 25, type: 'text' },
      { key: '会议类型', label: '会议类型', required: true, width: 15, type: 'select', options: ['分支机构年会', '董事会', '其他会议'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '会议时间', label: '会议时间', required: true, width: 15, type: 'text' },
      { key: '会议地点', label: '会议地点', required: true, width: 25, type: 'text' },
      { key: '参与人数', label: '参与人数', required: false, width: 10, type: 'number' },
      { key: '会议内容', label: '会议内容', required: true, width: 40, type: 'textarea' },
      { key: '服务要求', label: '服务要求', required: false, width: 40, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // ========== 差旅交通及部门内部活动 ==========
  '差旅': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'CX-001' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['差旅管理', '酒店', '机票', '火车', '第三方支付', '其他服务'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '服务要求', label: '服务要求', required: true, width: 40, type: 'textarea' },
      { key: '服务级别', label: '服务级别', required: false, width: 15, type: 'select', options: ['经济型', '舒适型', '商务型', '豪华型'] },
      { key: '预计业务量', label: '预计业务量', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '车辆': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'CL-001' },
      { key: '用车类型', label: '用车类型', required: true, width: 15, type: 'select', options: ['班车', '集中调度车', '网约车', '领导用车'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '用车需求', label: '用车需求', required: true, width: 40, type: 'textarea' },
      { key: '服务频次', label: '服务频次', required: false, width: 15, type: 'text' },
      { key: '车辆要求', label: '车辆要求', required: false, width: 25, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '部门会议及团建': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'TJ-001' },
      { key: '活动名称', label: '活动名称', required: true, width: 25, type: 'text' },
      { key: '活动类型', label: '活动类型', required: true, width: 12, type: 'select', options: ['部门会议', '团建活动'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '活动时间', label: '活动时间', required: true, width: 15, type: 'text' },
      { key: '活动地点', label: '活动地点', required: true, width: 25, type: 'text' },
      { key: '参与人数', label: '参与人数', required: false, width: 10, type: 'number' },
      { key: '活动内容', label: '活动内容', required: true, width: 40, type: 'textarea' },
      { key: '服务要求', label: '服务要求', required: false, width: 40, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // ========== 公关品牌相关 ==========
  '线上活动': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'XS-001' },
      { key: '活动名称', label: '活动名称', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '活动时间', label: '活动时间', required: true, width: 15, type: 'text' },
      { key: '活动平台', label: '活动平台', required: false, width: 20, type: 'text' },
      { key: '活动内容', label: '活动内容', required: true, width: 40, type: 'textarea' },
      { key: '参与人数', label: '参与人数', required: false, width: 10, type: 'number' },
      { key: '服务要求', label: '服务要求', required: false, width: 40, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '线下活动': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'XX-001' },
      { key: '活动名称', label: '活动名称', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '活动时间', label: '活动时间', required: true, width: 15, type: 'text' },
      { key: '活动地点', label: '活动地点', required: true, width: 25, type: 'text' },
      { key: '参与人数', label: '参与人数', required: false, width: 10, type: 'number' },
      { key: '活动内容', label: '活动内容', required: true, width: 40, type: 'textarea' },
      { key: '服务要求', label: '服务要求', required: false, width: 40, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '媒体管理': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'MT-001' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['媒体关系维护', '新媒体管理', '危机公关', '媒体活动', '境外媒体', '媒体投放'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '服务目标', label: '服务目标', required: false, width: 30, type: 'textarea' },
      { key: '服务周期', label: '服务周期', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '品牌管理及推广（境内外）': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'PP-001' },
      { key: '项目名称', label: '项目名称', required: true, width: 25, type: 'text' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['品牌战略', '视频制作', '多媒体策划', '平面设计', '展览展示', '版权购买', '广告投放', '渠道购买'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '项目内容', label: '项目内容', required: true, width: 40, type: 'textarea' },
      { key: '目标受众', label: '目标受众', required: false, width: 25, type: 'text' },
      { key: '服务周期', label: '服务周期', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '线上宣传': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'XC-001' },
      { key: '项目名称', label: '项目名称', required: true, width: 25, type: 'text' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['官网设计', '内网设计', '新媒体宣传', '企业微信宣传'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '项目需求', label: '项目需求', required: true, width: 40, type: 'textarea' },
      { key: '平台要求', label: '平台要求', required: false, width: 25, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '舆情监测': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'YQ-001' },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '监测范围', label: '监测范围', required: false, width: 30, type: 'textarea' },
      { key: '服务期限', label: '服务期限', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '内宣': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'NX-001' },
      { key: '项目名称', label: '项目名称', required: true, width: 25, type: 'text' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['新闻中心建设', '年会策划', '品牌礼品', 'PR宣传品'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '项目需求', label: '项目需求', required: true, width: 40, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '部门礼品': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'LP-001' },
      { key: '礼品名称', label: '礼品名称', required: true, width: 20, type: 'text' },
      { key: '用途', label: '用途', required: true, width: 20, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '数量', label: '数量', required: true, width: 10, type: 'number' },
      { key: '单位', label: '单位', required: true, width: 8, type: 'select', options: ['份', '个', '盒', '套'] },
      { key: '规格要求', label: '规格要求', required: false, width: 25, type: 'textarea' },
      { key: '材质要求', label: '材质要求', required: false, width: 20, type: 'text' },
      { key: 'Logo/印字要求', label: 'Logo/印字要求', required: false, width: 20, type: 'text' },
      { key: '预算单价（元）', label: '预算单价（元）', required: false, width: 15, type: 'number' },
      { key: '预算总价（元）', label: '预算总价（元）', required: false, width: 15, type: 'number' },
      { key: '交付日期', label: '交付日期', required: false, width: 15, type: 'date' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // ========== IT类相关 ==========
  'IT硬件': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'IT-001' },
      { key: '设备名称', label: '设备名称', required: true, width: 25, type: 'text' },
      { key: '设备类型', label: '设备类型', required: true, width: 15, type: 'select', options: ['服务器', '网络设备', '存储设备', '通讯设备', '办公电脑', '办公设备', 'License'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '规格型号', label: '规格型号', required: true, width: 30, type: 'text' },
      { key: '数量', label: '数量', required: true, width: 10, type: 'number' },
      { key: '单位', label: '单位', required: true, width: 8, type: 'select', options: ['台', '个', '套', '个'] },
      { key: '技术参数', label: '技术参数', required: false, width: 40, type: 'textarea' },
      { key: '品牌要求', label: '品牌要求', required: false, width: 15, type: 'text' },
      { key: '预算单价（元）', label: '预算单价（元）', required: false, width: 15, type: 'number' },
      { key: '预算总价（元）', label: '预算总价（元）', required: false, width: 15, type: 'number' },
      { key: '交货期限', label: '交货期限', required: false, width: 15, type: 'date' },
      { key: '质保期', label: '质保期', required: false, width: 15, type: 'text' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  'IT软件及系统': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'SW-001' },
      { key: '软件名称', label: '软件名称', required: true, width: 25, type: 'text' },
      { key: '软件类型', label: '软件类型', required: true, width: 15, type: 'select', options: ['数据库软件', '网络管理软件', '办公软件', '业务软件', '其他软件'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '功能需求', label: '功能需求', required: true, width: 40, type: 'textarea' },
      { key: '用户数量', label: '用户数量', required: false, width: 10, type: 'number' },
      { key: '部署方式', label: '部署方式', required: false, width: 15, type: 'select', options: ['本地部署', '云端部署', '混合部署'] },
      { key: '品牌要求', label: '品牌要求', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  'IT专业服务': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'IS-001' },
      { key: '服务项目名称', label: '服务项目名称', required: true, width: 25, type: 'text' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['机房租赁', '软件开发', '工程师驻场', 'IT外包', 'IT咨询', '安装部署', '其他服务'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '技术要求', label: '技术要求', required: false, width: 40, type: 'textarea' },
      { key: '服务周期', label: '服务周期', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  'IT软硬件维保服务': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'WB-001' },
      { key: '维保项目名称', label: '维保项目名称', required: true, width: 25, type: 'text' },
      { key: '设备/系统类型', label: '设备/系统类型', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '维保范围', label: '维保范围', required: true, width: 40, type: 'textarea' },
      { key: '服务级别要求', label: '服务级别要求', required: false, width: 30, type: 'textarea' },
      { key: '响应时间要求', label: '响应时间要求', required: false, width: 20, type: 'text' },
      { key: '维保期限', label: '维保期限', required: false, width: 15, type: 'text' },
      { key: '预算金额（元/年）', label: '预算金额（元/年）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '市场数据': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'SC-001' },
      { key: '数据产品名称', label: '数据产品名称', required: true, width: 25, type: 'text' },
      { key: '数据类型', label: '数据类型', required: true, width: 15, type: 'select', options: ['终端数据', '数据库数据'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '数据内容要求', label: '数据内容要求', required: true, width: 40, type: 'textarea' },
      { key: '使用部门', label: '使用部门', required: false, width: 15, type: 'text' },
      { key: '使用人数', label: '使用人数', required: false, width: 10, type: 'number' },
      { key: '预算金额（元/年）', label: '预算金额（元/年）', required: false, width: 15, type: 'number' },
      { key: '服务期限', label: '服务期限', required: false, width: 15, type: 'text' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  'IT通讯类': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'TX-001' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['线路通讯', '专线租赁', '移动通讯'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '带宽/容量要求', label: '带宽/容量要求', required: false, width: 20, type: 'text' },
      { key: '使用人数', label: '使用人数', required: false, width: 10, type: 'number' },
      { key: '预算金额（元/月）', label: '预算金额（元/月）', required: false, width: 15, type: 'number' },
      { key: '服务期限', label: '服务期限', required: false, width: 15, type: 'text' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  'IT云相关建设及服务': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'YJ-001' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['服务器租赁', '网络设备租赁', '软件订阅'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '配置要求', label: '配置要求', required: true, width: 40, type: 'textarea' },
      { key: '性能要求', label: '性能要求', required: false, width: 30, type: 'textarea' },
      { key: '安全要求', label: '安全要求', required: false, width: 30, type: 'textarea' },
      { key: '预算金额（元/月）', label: '预算金额（元/月）', required: false, width: 15, type: 'number' },
      { key: '服务期限', label: '服务期限', required: false, width: 15, type: 'text' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  // ========== 专业服务 ==========
  '法律咨询及服务': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'FL-001' },
      { key: '法律服务项目', label: '法律服务项目', required: true, width: 25, type: 'text' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['常务法务', '诉讼仲裁', '商标注册', '合规监管'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '律师资质要求', label: '律师资质要求', required: false, width: 30, type: 'textarea' },
      { key: '服务周期', label: '服务周期', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '公司保险服务': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'BX-001' },
      { key: '保险服务类型', label: '保险服务类型', required: true, width: 20, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '公司财务咨询及服务': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'CW-001' },
      { key: '财务服务项目', label: '财务服务项目', required: true, width: 25, type: 'text' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['税务咨询', '审计服务', '财务外包', '转移定价', '鉴证报告', '税务代理', '专项审计'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '会计师资质要求', label: '会计师资质要求', required: false, width: 30, type: 'textarea' },
      { key: '服务周期', label: '服务周期', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '人力资源咨询及服务': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'RL-001' },
      { key: '人力资源项目', label: '人力资源项目', required: true, width: 25, type: 'text' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['培训', '咨询', '猎头', '背景调查', '校园招聘', '员工福利', '劳务派遣', '服务外包', '薪酬调研', '个税服务', '工作签证', '网络招聘', 'Payroll', '人事管理', '年金服务'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '服务周期', label: '服务周期', required: false, width: 15, type: 'text' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '其他业务流程外包或专业服务': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'BPO-001' },
      { key: 'BPO项目名称', label: 'BPO项目名称', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '服务要求', label: '服务要求', required: false, width: 40, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '业务相关服务': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'YW-001' },
      { key: '中介服务项目', label: '中介服务项目', required: true, width: 25, type: 'text' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['会计师事务所', '资产评估', '评级机构', '背景调查', '人力资源咨询', '财经公关'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '业务相关服务-律师事务所': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'LS-001' },
      { key: '法律服务项目', label: '法律服务项目', required: true, width: 25, type: 'text' },
      { key: '服务类型', label: '服务类型', required: true, width: 15, type: 'select', options: ['私募基金', '业务法律咨询', 'IPO', '债券发行', 'ABS', '再融资', '重组', '新三板', '资本金业务'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '律师资质要求', label: '律师资质要求', required: false, width: 30, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '其他服务': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'QT-001' },
      { key: '服务项目名称', label: '服务项目名称', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '服务内容', label: '服务内容', required: true, width: 40, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '其他管理咨询服务': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'GL-001' },
      { key: '咨询项目名称', label: '咨询项目名称', required: true, width: 25, type: 'text' },
      { key: '咨询类型', label: '咨询类型', required: true, width: 15, type: 'select', options: ['管理咨询', '行业调研'] },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '咨询内容', label: '咨询内容', required: true, width: 40, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },

  '投研报告': {
    columns: [
      { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
      { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'BG-001' },
      { key: '数据服务名称', label: '数据服务名称', required: true, width: 25, type: 'text' },
      { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
      { key: '数据内容要求', label: '数据内容要求', required: true, width: 40, type: 'textarea' },
      { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
      { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
    ],
  },
};

async function updateAllCategoriesWithSecondLevelTemplates() {
  try {
    // 连接数据库
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/procureai';
    await mongoose.connect(MONGODB_URI);
    console.log('✓ MongoDB Connected');

    // 获取所有品类
    const categories = await ProcurementCategory.find({});
    console.log(`\n找到 ${categories.length} 个品类`);

    // 统计信息
    const stats = {};
    let successCount = 0;
    let failCount = 0;

    // 为每个品类基于二级品类分配模板
    for (const category of categories) {
      // 从品类数据中找到对应的二级品类
      const categoryData = categoriesData.find(c => c.三级品类 === category.name);
      let templateColumns = null;
      let templateType = 'DEFAULT';

      if (categoryData) {
        const secondLevel = categoryData.二级品类;

        if (ALL_SECOND_LEVEL_TEMPLATES[secondLevel]) {
          templateColumns = ALL_SECOND_LEVEL_TEMPLATES[secondLevel].columns;
          templateType = secondLevel;
        }
      }

      // 如果没有匹配到，使用通用模板
      if (!templateColumns) {
        templateColumns = [
          { key: '序号', label: '序号', required: true, width: 6, type: 'number', defaultValue: '1' },
          { key: '需求编号', label: '需求编号', required: true, width: 15, type: 'text', defaultValue: 'REQ-001' },
          { key: '项目名称', label: '项目名称', required: true, width: 25, type: 'text' },
          { key: '业务背景', label: '业务背景', required: true, width: 35, type: 'textarea' },
          { key: '优先级', label: '优先级', required: true, width: 8, type: 'select', options: ['紧急', '高', '中', '低'], defaultValue: '中' },
          { key: '需求内容', label: '需求内容', required: true, width: 40, type: 'textarea' },
          { key: '预算金额（元）', label: '预算金额（元）', required: false, width: 15, type: 'number' },
          { key: '交付日期', label: '交付日期', required: false, width: 15, type: 'date' },
          { key: '备注', label: '备注', required: false, width: 30, type: 'textarea' },
        ];
        templateType = 'DEFAULT';
      }

      // 统计
      if (!stats[templateType]) {
        stats[templateType] = [];
      }
      stats[templateType].push(category.name);

      // 更新模板配置
      await ProcurementCategory.updateOne(
        { _id: category._id },
        {
          $set: {
            'templateConfig.columns': templateColumns,
            'templateConfig.sheets': [
              { name: '需求清单', type: 'main', enabled: true },
              { name: '项目概要', type: 'summary', enabled: true },
              { name: '填写说明', type: 'instruction', enabled: true },
            ],
          }
        }
      );

      successCount++;
      console.log(`✓ ${category.name} -> ${templateType} (${templateColumns.length} 字段)`);
    }

    console.log('\n\n======== 更新统计 ========');
    console.log(`成功更新: ${successCount} 个品类`);
    console.log(`失败: ${failCount} 个品类`);
    console.log('\n各二级品类模板使用情况:');
    for (const [type, names] of Object.entries(stats)) {
      console.log(`\n${type} (${names.length} 个品类):`);
      names.slice(0, 3).forEach(name => console.log(`  - ${name}`));
      if (names.length > 3) {
        console.log(`  ... 还有 ${names.length - 3} 个`);
      }
    }

    await mongoose.disconnect();
    console.log('\n✓ 数据库连接已关闭');
    console.log('\n✅ 所有品类模板更新完成!');

  } catch (error) {
    console.error('❌ 更新失败:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// 运行更新
updateAllCategoriesWithSecondLevelTemplates();
