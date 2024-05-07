<template>
  <div class="page-welcome">
    <bread-crumb :showBack="true" :pageTitle="backTitle" :backUrl="backUrl"></bread-crumb>
    <div class="page-welcome-wrapper">
      <el-form ref="form" :model="form" label-width="100px" class="form">
        <!-- eslint-disable-next-line -->
        <el-form-item label="使用员工" v-if="form.type == 3">
          <el-tag
            :key="i"
            effect="plain"
            type="info"
            v-for="(tag, i) in staffList"
            size="medium"
            :disable-transitions="false"
            @close="handleUserClose(tag, i)"
          >
            <svg-icon
              class="staff-icon"
              icon-class="file"
              v-if="!tag.isUser"
            ></svg-icon>
            <svg-icon class="staff-icon" icon-class="use" v-else></svg-icon>
            <open-data-box :name="tag.name" :isUser="tag.isUser" />
          </el-tag>
          <el-button
            type="text"
            v-if="staffList.length > 0"
            size="medium"
            @click="showCustomer = true"
          >修改
          </el-button
          >
          <el-button v-else size="mini" type="text" @click="showCustomer = true"
          >添加
          </el-button
          >
        </el-form-item>
        <el-form-item :class="{'customer-label': form.type == 2}" :label="form.type == 2 ? '客户群欢迎语' : '欢迎语'">
          <div class="chat-opertion-box" :class="tabType !== 1 && form.materialType === 0 ? 'padingB0':''">
            <div class="textarea-wrapper">
              <el-input
                v-model="meterailContext.text"
                type="textarea"
                id="textarea"
                maxlength="1000"
                resize="none"
                placeholder="请输入"
                @input="textChange"
              ></el-input>
              <div class="textarea-btns">
                <el-button
                  class="insert-msg-btn"
                  type="info"
                  round
                  icon="el-icon-user-solid"
                  @click="insertCustomerName('#客户昵称#')"
                >插入客户昵称
                </el-button
                >
              </div>
            </div>
            <WsSelectMaterials
              v-model="materialList"
              :textInfo.sync="textInfo"
              :config="config"
              :isUploadProcess.sync="isProcess"
              :hasGroup="tabType !== 2"
              @contentChage="contentChage"
            >
            </WsSelectMaterials>
          </div>
        </el-form-item>
        <el-form-item label="配置群聊" v-if="form.type * 1 === 2">
          <addGroup v-model="groupSelect"></addGroup>
        </el-form-item>
        <div class="divide" v-if="form.type * 1 === 2"></div>
        <el-form-item>
          <el-button
            type="primary"
            @click="onSubmit('add')"
            :loading="saveLoading"
            :disabled="isProcess"
            v-if="!id"
          >{{ form.type * 1 === 2 ? '通知群主配置' : '保存' }}
          </el-button>
          <el-button
            type="primary"
            @click="onSubmit('edit')"
            :loading="saveLoading"
            :disabled="isProcess"
            v-else
          >{{ form.type * 1 === 2 ? '通知群主配置' : '保存' }}
          </el-button>
          <div class="tips" v-if="form.type * 1 === 2">
            <span>将以通知的形式发送给对应群聊的群主，并生成一条待办消息</span>
            <el-popover
              ref="popover"
              placement="top"
              width="748"
              trigger="click"
            >
              <div class="example-wrapper">
                <div class="example-item">
                  <img src="@/assets/images/customer-marketing/welcome-example1.png" />
                  <span>1.员工收到一条配置通知</span>
                </div>
                <div class="example-item">
                  <img src="@/assets/images/customer-marketing/welcome-example2.png" />
                  <span>2.点击卡片前往配置</span>
                </div>
                <div class="example-item">
                  <img src="@/assets/images/customer-marketing/welcome-example3.png" />
                  <span>3.点击[去配置]</span>
                </div>
                <div class="example-item">
                  <img src="@/assets/images/customer-marketing/welcome-example4.png" />
                  <span>4.点击[入群欢迎语]进行配置</span>
                </div>
              </div>
              <i slot="reference" class="el-icon-warning-outline"></i>
            </el-popover>
          </div>
          <el-button v-if="form.type * 1 !== 2" @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
      <PreviewNew
        :materialList="materialList"
        :text="meterailContext.text"
        :type="+form.type"
      ></PreviewNew>
    </div>
    <el-dialog title="组织架构" :visible.sync="showCustomer">
      <customer-select
        :mode="2"
        :defaultSelected="staffList"
        :isMultiple="true"
        @selectChange="selectChange"
      ></customer-select>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showCustomer = false">取 消</el-button>
        <el-button type="primary" @click="ensureStaff">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { UPLOAD_URL, DOWNLOAD_URL } from '@/config';
import { getToken } from '@/utils/cookies';
import BreadCrumb from '@/components/BreadCrumb';
import CustomerSelect from '@/components/DepartmentCustomerSelect/index';
import WsSelectMaterials from '@/components/common/WsSelectMaterials';
import PreviewNew from './components/PreviewNew';
import addGroup from './components/add-group';
import { setPageScrollTop } from '@/utils/utils';
import { hasMaterialGroup, sendMaterialGroup } from '@/components/common/WsSelectMaterials/config/util.ts';
import {
  addDrainageWelcome,
  getDrainageWelcome,
  updateDrainageWelcome,
  addDepartWelcome,
  updateDepartWelcome,
  getDepartWelcome,
  queryChartOwner
} from '@/api/customer-operations/drainage';
import { createNamespacedHelpers } from 'vuex';
import { types } from '@/store/modules/material';

const { mapState } = createNamespacedHelpers('mall-center');
const { mapMutations } = createNamespacedHelpers('material');

const TITLE_LIST = [
  {
    titleAdd: '新建员工欢迎语',
    titleEdit: '编辑员工欢迎语'
  },
  {
    titleAdd: '新建客户群欢迎语',
    titleEdit: '编辑客户群欢迎语'
  },
  {
    titleAdd: '新建部门员工欢迎语',
    titleEdit: '编辑部门员工欢迎语'
  }
];

export default {
  components: {
    BreadCrumb,
    CustomerSelect,
    WsSelectMaterials,
    PreviewNew,
    addGroup
  },
  data() {
    return {
      id: '',
      type: '',
      form: {},
      backTitle: '',
      showCustomer: false,
      staff: [],
      staffList: [],
      meterailContext: {
        text: '',
        img: '',
        time: '',
        desc: '',
        title: ''
      },
      headers: {},
      selectMiniData: {},
      selectWebData: {},
      apiUrl: UPLOAD_URL + '?type=1',
      srcUrl: DOWNLOAD_URL + '?id=',
      materialType: ['text'],
      formLabelWidth: '140px',
      dialogWebVisible: false,
      dialogWeb1Visible: false,
      dialogMiniVisible: false,
      saveLoading: false,
      materialList: [],
      textInfo: {},
      tabType: this.$route.query.type * 1,
      isProcess: false,
      sourcePage: this.$route.query.sourcePage, // 跳转至活码页面的原页面‘优惠券’
      backUrl: '',
      groupSelect: []
    };
  },
  computed: {
    ...mapState(['messageParams']),
    showNewPreview() {
      return this.materialList.length || Object.keys(this.textInfo).length;
    },
    config() {
      return this.tabType === 2 ? {
        isMix: false,
        radioTypes: ['article', 'file', 'video', 'web', 'img', 'app'],
        limit: 1,
        videoSize: 100,
        fileSize: 50,
        showGoodsCoupon: true
      } : {
        videoSize: 100,
        fileSize: 50
      };
    },
    disSubmitBtn() {
      const { meterailContext, groupSelect, materialList } = this;
      return { text: meterailContext.text, groupSelect, materialList };
    }
  },
  watch: {
    'meterailContext.text': {
      handler: function(newVal) {
        const { type } = this.form;
        if (+type !== 2 || this.id) return;
        this.isProcess = !newVal;
      },
      immediate: true
    },
    disSubmitBtn: {
      handler: function(newVal, oldVal) {
        const { type } = this.form;
        if (+type !== 2 || !this.id) return;
        const hasVal = Object.values(oldVal).some(item => {
          if (typeof item === 'string') {
            return !!item;
          }
          return !!item.length;
        });
        hasVal && (this.isProcess = !this.meterailContext.text);
      },
      deep: true
    }
  },
  async mounted() {
    window.EEE = this;
    setPageScrollTop();
    this.id = this.$route.query.id;
    this.form.type = this.$route.query.type;
    this.headers = { Authorization: 'Bearer ' + getToken() };
    this.updateTitle(this.form.type);
    this.initCouponData();
    // eslint-disable-next-line
    if (this.form.type == '2') {
      this.isProcess = true;
    }
    if (!this.id) return;
    let res = {};
    // eslint-disable-next-line
    if (this.form.type == '3') {
      res = await getDepartWelcome({ id: this.id });
    } else {
      res = await getDrainageWelcome({ id: this.id });
    }
    if (res.success) {
      this.form = res.data;
      // eslint-disable-next-line
      if (this.form.type == '3') {
        this.staffList = this.form.namesList;
        const userList = [];
        const departList = [];
        for (let i = 0; i < this.staffList.length; i++) {
          this.staffList[i].isUser
            ? userList.push(this.staffList[i].userId || this.staffList[i].name)
            // ? userList.push(this.staffList[i].id)
            : departList.push(this.staffList[i].name);
        }
        if (userList.length > 0) {
          this.form.greetingIdList = userList;
        }

        if (departList.length > 0) {
          this.form.deptIdList = departList;
        }
      }
      let materials = JSON.parse(res.data.materialToContent).materials;
      materials.map(e => {
        // eslint-disable-next-line valid-typeof
        if (typeof (e.type) === 'number') {
          e.type = this.setType(e.type);
        }
      });
      this.materialList = materials;
      this.textInfo = JSON.parse(res.data.materialToContent).contentInfo;
      delete this.form.materialToContent;
      delete this.form.materialIds;
      this.meterailContext.text = this.form.greeting;
      // eslint-disable-next-line
      if (this.form.type == '2') {
        const chatInfoList = res.data.chatInfoList ?? [];
        this.groupSelect = chatInfoList.map(chat => {
          chat.name = chat.chatName;
          return chat;
        });
      }
    } else {
      this.$message({
        type: 'error',
        message: res.message,
        offset: 100
      });
    }
  },
  methods: {
    ...mapMutations([types.SELECT_UPDATE]),
    initCouponData() {
      if (this.sourcePage !== 'coupon') {
        return;
      }
      this.backUrl = '/mall-center/market-center/coupon';
      const {
        miniAppInfo = {},
        id,
        taskId,
        name = '',
        textContent = ''
      } = this.messageParams;
      this.meterailContext.text = textContent;
      this.materialList.push(
        {
          type: 'coupon',
          title: name,
          id: id,
          taskId: taskId,
          headImg: miniAppInfo.headImg,
          appName: miniAppInfo.nickName,
          appId: miniAppInfo.appId,
          imageBaseUrl: miniAppInfo.imageUrl,
          appPicUrl: miniAppInfo.imageUrl,
          appPath: miniAppInfo.appPath,
          appTitle: name,
          materialType: 10,
          disabledDel: true
        }
      );
    },
    setType(type) {
      let str = '';
      switch (type) {
        case 3:
          str = 'img';
          break;
        case 4:
          str = 'article';
          break;
        case 9:
          str = 'web';
          break;
        case 8:
          str = 'app';
          break;
      }
      return str;
    },
    /**
     * @description: 输入框内容辩护
     * @param {*}
     * @return {*}
     * @author: zrk
     */
    textChange(val) {
      this.textInfo = { plainText: val };
    },
    /**
     * @description: 文本内容变化
     * @param {*}
     * @return {*}
     * @author: zrk
     */
    contentChage() {
      if (Object.keys(this.textInfo).length && this.textInfo.id !== '') {
        if (this.meterailContext.text.indexOf('#客户昵称#') > -1) {
          this.meterailContext.text = '#客户昵称#' + this.textInfo.plainText;
        } else {
          this.meterailContext.text = this.textInfo.plainText;
        }
      }
    },
    /**
     * type: 1：员工欢迎语  2：客户群欢迎语  3：部门员工欢迎语
     */
    updateTitle(type) {
      if (this.id) {
        // 编辑
        this.backTitle = TITLE_LIST[type - 1].titleEdit;
      } else {
        // 新增
        this.backTitle = TITLE_LIST[type - 1].titleAdd;
      }
    },
    // 上传欢迎语图片
    handleAvatarSuccess(res) {
      if (res.code === 200) {
        this.form.fileId = res.data.id;
        this.form.materialType = 1;
        this.materialType = ['text', 'picture'];
        this.meterailContext.img = this.form.fileId;
      }
    },
    beforeUpload(file) {
      const { size } = file;
      const isLt2M = size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message({
          type: 'error',
          offset: 88,
          message: '图片大小不超过2M!'
        });
        return false;
      }
      return true;
    },
    // 选择网页
    MaterialWebPicked(material) {
      console.log(material, 'material----');
      this.selectWebData = material.value;
    },
    // 上传欢迎语网址
    handleWeb() {
      const obj = this.selectWebData;
      if (Object.keys(obj).length < 1) {
        this.message({
          type: 'error',
          message: '请选择文章！'
        });
        return false;
      }
      this.form.materialType = 2;
      this.materialType = ['text', 'web'];
      this.form.webId = obj.id;
      this.meterailContext.title = obj.title;
      this.meterailContext.img = obj.imageBase;
      this.meterailContext.time = obj.updateTime;
      this.meterailContext.desc = obj.abstractInfo;
      this.meterailContext.webUrl = obj.webUrl;
      this.dialogWebVisible = false;
    },
    // 上传欢迎语网址
    handleWeb1() {
      const obj = this.selectWebData;
      console.log(obj, 'obj');
      if (Object.keys(obj).length < 1) {
        this.message({
          type: 'error',
          message: '请选择网页！'
        });
        return false;
      }
      this.form.materialType = 9;
      this.materialType = ['text', 'web1'];
      this.form.webId = obj.id;
      this.meterailContext.title = obj.title;
      this.meterailContext.img = obj.imageBase;
      this.meterailContext.time = obj.updateTime;
      this.meterailContext.desc = obj.abstractInfo;
      this.meterailContext.webUrl = obj.shortLink;
      this.dialogWeb1Visible = false;
    },
    // 选择员工
    selectChange(data) {
      this.staff = data;
    },
    // 确定员工
    ensureStaff() {
      const arr = this.staff;
      console.info(this.staff);
      if (arr.length > 0) {
        const userList = [];
        const departList = [];
        for (let i = 0; i < arr.length; i++) {
          !arr[i].isUser
            ? departList.push(arr[i].name)
            : userList.push(arr[i].userId || arr[i].name);
          // : userList.push(arr[i].id);
        }
        this.staffList = Object.assign([], arr);
        this.form.greetingIdList = userList;
        this.form.deptIdList = departList;
      }
      this.showCustomer = false;
    },
    // 选择小程序
    MaterialPicked(material) {
      this.selectMiniData = material.value;
    },
    // 上传选择小程序
    handleMini() {
      const obj = this.selectMiniData;
      if (Object.keys(obj).length < 1) {
        this.message({
          type: 'error',
          message: '请选择小程序！'
        });
        return false;
      }

      this.form.materialType = 3;
      this.materialType = ['text', 'miniprogram'];
      this.meterailContext.title = this.selectMiniData.title;
      this.meterailContext.img = this.selectMiniData.imageBase;
      this.form.appId = this.selectMiniData.id;
      this.dialogMiniVisible = false;
    },

    // 删除欢迎语图片/网页/小程序
    handleRemove() {
      this.meterailContext.title = ''; // 标题
      this.meterailContext.img = ''; // 图片
      this.meterailContext.time = ''; // 时间
      this.meterailContext.desc = ''; // 描述
      this.materialType = ['text'];

      if (this.form.materialType) {
        this.form.materialType = 0;
      }
      if (this.form.webId) {
        this.form.webId = 0;
      }
      if (this.form.appId) {
        this.form.appId = 0;
      }
      if (this.form.fileId) {
        this.form.fileId = 0;
      }
    },
    // 插入员工昵称
    insertCustomerName(myValue) {
      // 判断输入框是否有可用空间
      const textField = document.getElementById('textarea'); // vue 获取的$el节点木有selectionStart和selectionEnd属性
      let startPos, endPos;
      // eslint-disable-next-line
      if (this.meterailContext.text.length > 994) {
        this.$message({
          offset: 100,
          type: 'error',
          message: '最多输入1000个字'
        });
        return;
      }
      if (
        typeof textField.selectionStart === 'number' &&
        typeof textField.selectionEnd === 'number'
      ) {
        startPos = textField.selectionStart;
        endPos = textField.selectionEnd;
        this.meterailContext.text =
          textField.value.substring(0, startPos) +
          myValue +
          textField.value.substring(endPos, textField.value.length);
      } else {
        this.meterailContext.text += myValue;
        this.textInfo.id = '';
      }
      textField.focus();
    },
    computedTrackType(payload) {
      // 首先判断 新增还是编辑
      let trackType = '';
      if (this.id) {
        // 编辑
        switch (payload.type * 1) {
          case 1:
            trackType = 'marketing_0053';
            break;
          case 2:
            trackType = 'marketing_0059';
            break;
          case 3:
            trackType = 'marketing_0056';
            break;
        }
      } else {
        // 新增
        switch (payload.type * 1) {
          case 1:
            trackType = 'marketing_0054';
            break;
          case 2:
            trackType = 'marketing_0060';
            break;
          case 3:
            trackType = 'marketing_0057';
            break;
        }
      }
      return trackType;
    },
    setParams(baseForm) {
      let materials = this.materialList;
      let materialInfoList = [];
      materials.forEach(item => {
        let materialInfo = {
          id: item.id, // 素材id
          type: item.materialType // 素材类型
        };
        if (item.groupMaterialId) { // 组合素材 需要携带组合素材信息
          Object.assign(materialInfo, {
            combinationId: item.groupMaterialId, // 组合素材id
            packageConfigId: item.packageConfigId // 组合素材分类id
          });
        }
        materialInfoList.push(materialInfo);
      });
      baseForm.materialIds = materials.map(e => e.id).join(',');
      baseForm.materialInfoList = materialInfoList;
      let materialToContent = {
        contentInfo: this.textInfo,
        materials: this.materialList
      };
      baseForm.materialToContent = JSON.stringify(materialToContent);
      return baseForm;
    },
    // 处理优惠券
    setCouponParams(baseForm) {
      let index = this.materialList.findIndex(item => {
        return item.type === 'coupon' || item.type === 'goods';
      });
      if (index > -1) {
        let materialData = this.materialList[index];
        baseForm.materialIds = '';
        baseForm.miniAppId = materialData.appId;
        baseForm.appPath = materialData.appPath;
        baseForm.miniTitle = materialData.appTitle;
        // baseForm.miniImg = materialData.imageBase;
        baseForm.miniImgUrl = materialData.appPicUrl;
        baseForm.isGoods = true;
      }
    },
    onSubmit(type) {
      this.form.greeting = this.meterailContext.text.slice(0, 1000);
      if (!this.form.greeting) {
        this.message({
          type: 'error',
          message: '请输入欢迎语'
        });
        return;
      }
      this.$refs.form.validate(async e => {
        if (e) {
          try {
            let res = {};
            let baseForm = Object.assign({}, this.form);
            baseForm = this.setParams(baseForm);
            this.setCouponParams(baseForm);
            if (baseForm.type * 1 === 3) {
              if (this.staffList.length === 0) {
                this.$message({
                  offset: 100,
                  type: 'error',
                  message: '使用员工不能为空！'
                });
                return false;
              }
              this.saveLoading = true;
              delete baseForm.namesList;
              res = baseForm.id
                ? await updateDepartWelcome(baseForm)
                : await addDepartWelcome(baseForm);
            } else {
              this.saveLoading = true;
              if (baseForm.webAbstract) {
                delete baseForm.webAbstract;
              }
              if (baseForm.webCreateTime) {
                delete baseForm.webCreateTime;
              }
              if (baseForm.webImage) {
                delete baseForm.webImage;
              }
              if (baseForm.webTitle) {
                delete baseForm.webTitle;
              }
              if (+baseForm.type === 2) {
                try {
                  const chatIds = this.groupSelect.map(v => v.chatId);
                  const chatIdsStr = chatIds.join(',');
                  baseForm.chatIds = chatIdsStr;
                  baseForm.chatInfoList = this.groupSelect;
                  let param = {
                    chatIds: chatIdsStr
                  };
                  if (baseForm.id) {
                    param = {
                      chatIds: chatIdsStr,
                      id: baseForm.id,
                      materialIds: baseForm.materialIds,
                      greeting: baseForm.greeting
                    };
                  }
                  console.log('param', param);
                  if (chatIds.length) {
                    const res = await queryChartOwner(param);
                    const { code, data, msg, success } = res;
                    if (code === 200 && success) {
                      await this.$confirm(`将下发任务给${data}个群主，通知群主配置群欢迎语。`, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消'
                      });
                    } else {
                      this.saveLoading = false;
                      this.$message({
                        type: 'error',
                        offset: 88,
                        message: msg ?? '查询失败!'
                      });
                      return;
                    }
                  }
                } catch (e) {
                  this.saveLoading = false;
                  return;
                }
              }
              res = baseForm.id
                ? await updateDrainageWelcome(baseForm)
                : await addDrainageWelcome(baseForm);
            }
            this.message({
              type: res.success ? 'success' : 'error',
              message: res.message
            });
            this.saveLoading = false;
            if (res.success === true) {
              this.$trackServer.setTrack(this.computedTrackType(baseForm), {
                content: baseForm
              });
              // 组合素材埋点
              if (hasMaterialGroup(baseForm.materialToContent)) {
                if (Number(baseForm.type) === 1) {
                  this.$trackServer.setTrack('marketing_0291');
                }
                if (Number(baseForm.type) === 2) {
                  this.$trackServer.setTrack('marketing_0293');
                }
                if (Number(baseForm.type) === 3) {
                  this.$trackServer.setTrack('marketing_0292');
                }
                sendMaterialGroup(JSON.parse(baseForm.materialToContent || '{}').materials, this.$store.state.user);
              }
              if (this.sourcePage === 'coupon') {
                sessionStorage.setItem('welcome-tab', 'customer-welcome');
                this.$router.push({
                  path: '/customer-marketing/customer/welcome/index',
                  query: {
                    type: 'customer-welcome'
                  }
                });
              } else {
                this.$pageStack.invalidate('welcome', baseForm.id ? 'refresh' : 'page');
                this.$router.back();
              }
            }
          } catch (error) {
          }
        }
      });
    },

    message(res) {
      this.$message({
        offset: 100,
        type: res.type,
        message: res.message
      });
    },
    goBack() {
      if (this.backUrl) {
        this.$router.push(this.backUrl);
      } else {
        this.$router.back();
      }
    }
  },
  beforeRouteLeave(to, from, next) {
    this[types.SELECT_UPDATE]({
      pictureSelect: [],
      textSelect: '',
      videoSelect: -1,
      webSelect: -1,
      posterSelect: [],
      miniprogramSelect: -1
    });
    next();
  }
};
</script>

<style lang="scss" scoped>
.page-welcome {
  .page-welcome-wrapper {
    display: flex;
    padding: 32px 90px 216px 90px;

    ::v-deep .el-form-item__label {
      text-align: left;
    }

    .divide {
      border-bottom: 1px solid #EBEEF5;
      width: 546px;
      margin-bottom: 32px;
    }

    .form {
      width: 546px;
      margin-right: 50px;
    }
    .customer-label {
      ::v-deep .el-form-item__label{
        line-height: 1.5;
        padding-top: 16px;
      }
    }
    ::v-deep .el-tag {
      margin-right: 8px;
    }

    .staff-icon {
      font-size: 16px;
      vertical-align: sub;
      margin-right: 5px;
      color: transparent;
    }

    .chat-opertion-box {
      border-radius: 4px;
      padding: 16px;
      padding-bottom: 0;
      box-sizing: border-box;
      background-color: #f6f6f9;

      ::v-deep .el-textarea {
        padding-bottom: 40px;

        textarea {
          padding: 0 !important;
          height: 148px;

          &::placeholder {
            color: #c0c4cc;
          }
        }

        .el-textarea__inner {
          background-color: #f6f6f9;
        }
      }

      .textarea-wrapper {
        position: relative;

        .textarea-btns {
          position: absolute;
          bottom: 8px;
          width: 100%;
          text-align: right;
        }

        .insert-msg-btn {
          padding: 8px 12px;
          border: none;
          color: #606266 !important;
          background-color: #dddfe5;
          border: none;
          font-size: 12px;

          &:active {
            background-color: rgb(197, 198, 202);
          }
        }

        .select-btn {
          text-align: center;
          border: none;
          background: #ebeef5;
          color: #294ba3 !important;
          padding: 8px 12px;
          font-size: 12px;
        }
      }
    }

    // .chat-opertion-box.padingB0 {
    //   padding-bottom: 0;
    // }
    ::v-deep .el-textarea textarea {
      font-size: 14px;
      height: 360px;
      border: none !important;
      color: #333;
      font-family: '';
    }

    ::v-deep .el-textarea .el-input__count {
      right: 0px;
      color: #909399;
      background-color: #f6f6f9;
    }

    :v-deep .welcome-button {
      font-size: 12px;
      color: #323232;
      margin-top: 8px;
    }

    .chat-material-toolbars {
      padding-top: 12px;
      // border-top: 1px solid #dbdbdb;
      font-size: 12px;
      line-height: 12px;
      color: #303133;

      .reference {
        display: inline-block;
        cursor: pointer;
      }
    }

    .chat-material-toolbars.hasBorder {
      border-top: 1px solid #dbdbdb;
    }

    .wechatpreview {
      ::v-deep .chat-preview {
        margin-left: 0;
        min-height: 420px;
        width: 240px;

        .chat-preview-area {
          margin-top: 60px;
        }
      }

      ::v-deep .previewtitle {
        display: none;
      }
    }

    .popver-title {
      padding-top: 12px;
      line-height: 15px;
      border-top: 1px solid #dbdbdb;
      display: flex;
      align-items: center;

      i {
        font-size: 20px;
        color: #666;
        cursor: pointer;
      }

      .popver-img-content {
        width: 100px;
        height: 100px;
        position: relative;
        border: 1px dashed #ddd;

        img {
          width: 100%;
          height: 100%;
        }

        i {
          position: absolute;
          top: -5px;
          right: -5px;
        }
      }

      .miniprogram-info {
        border: 1px solid #eee;
        border-radius: 4px;
        padding: 12px;
        background-color: #fff;
        box-sizing: border-box;
        position: relative;

        .title {
          width: 130px;
          font-size: 12px;
          line-height: 12px;
          color: #303133;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin: 0;
        }

        img {
          width: 130px;
          height: 103px;
          margin-top: 8px;
        }

        .minip-title {
          color: #909399;
          font-size: 12px;
          word-wrap: break-word;
          word-break: normal;
          margin-top: 8px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          transform: scale(0.83);
          transform-origin: 0% 50%;
        }

        i {
          position: absolute;
          top: -5px;
          right: -5px;
        }
      }
    }

    ::v-deep .el-upload-list {
      display: none;
    }

    .el-icon-warning-outline {
      cursor: pointer;
      padding-left: 4px;
    }

    .tips {
      font-size: 12px;
      line-height: 12px;
      color: #909399;
      margin-top: 8px;
    }

    ::v-deep .el-button--small {
      font-size: 13px;
      padding: 7px 10px;
      margin-right: 6px;
    }
  }
}

.material-type-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  line-height: 12px;

  .icon {
    display: inline-block;
    font-size: 16px;
    margin-bottom: 8px;
  }

  .svg-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-bottom: 8px;
  }

  ::v-deep .el-button + .el-button {
    margin: 0px;
  }

  ::v-deep .el-button--small {
    width: 56px;
    height: 56px;
    padding: 0px;
  }
}

.img {
  width: 16px;
  height: 16px;
}

.welcome-button {
  font-size: 12px;
  color: #323232;
  margin-top: 8px;
}

.example-wrapper {
  display: flex;
  padding: 30px 14px 12px;
  justify-content: space-around;

  .example-item {
    width: 160px;
    text-align: center;

    img {
      width: 160px;
      height: 280px;
      vertical-align: top;
    }

    span {
      display: block;
      font-size: 12px;
      line-height: 17px;
      color: #303133;
      padding: 12px 4px 0;
    }
  }
}
</style>
