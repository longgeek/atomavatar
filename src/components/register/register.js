/**
 *  用户注册组件
 *  包含个人注册、企业注册，企业注册需要多填写公司名称、营业执照号码和上传营业执照图片
 */

import api from "@/api.config";
import uuidv1 from "uuid/dist/v1";
import { required, minLength, maxLength } from "vuelidate/lib/validators";


const data = function() {
    return {
        // 个人用户需要填写的 form 表单
        auth: {
            type: 'personal',               // 值为：personal 和 enterprise
            name: '',                       // 手机号或邮箱
            captcha: '',                    // 图片验证码
            msgCode: '',                    // 短信或邮箱验证码
            nickname: '',                   // 用户昵称
            password: '',                   // 用户密码
            repeatPassword: '',             // 用户密码
        },
        // 企业用户需要填写的 form 表单
        authCompany: {
            company: '',                    // 公司名称
            businessLicense: '',            // 公司营业执照号码
            businessLicenseFiles: [],       // 上传的营业执照图片
            businessLicenseFileNames: [],   // 上传的营业执照图片名称，用于上传按钮处展示
        },
        loading: false,                     // 控制提交按钮禁用
        submitted: false,                   // 代表表单被提交
        errorMsg: '',                       // 当表单有误时前端提醒文字

        // 图片验证码相关
        captcha: '',                        // 图片验证码 <img> 的 :src 值
        captchaToken: '',
        captchaLoading: false,              // 用于点击更换图片验证码

        // 短信、邮箱验证码相关
        msgCodeDisplay: true,               // 用于控制获取验证码按钮切换
        msgCodeTime: 60,                    // 用于设定短信验证码 CD 时长
        msgCodeTimer: 60,                   // 用于短信验证码计时
    }
};

const methods = {
    /*
     *  对手机号和邮箱判断
     */
    isPhone(v) { return /^[1][3,4,5,6,7,8][0-9]{9}$/.test(v) },
    isEmail(v) { return /.+@.+\..+/.test(v) },
    /*
     *  提交用户注册表单，用于验证输入格式是否有效
     */
    submit() {
        if (this.loading) return;

        this.loading = true;
        this.submitted = true;

        // 判断手机号或邮箱是否符合规范
        if (!this.isPhone(this.auth.name) && !this.isEmail(this.auth.name)) {
            this.errorMsg = '输入的手机号或邮箱格式有误，请重新输入';
            this.loading = false;
            return;
        }

        // 个人开发者 - 判断表单是否无效
        if (this.$v.auth.$invalid) {
            // 根据表单错误项输出提示内容
            if (this.$v.auth.name.$error) { this.errorMsg = '请输入手机号或邮箱' }
            else if (this.$v.auth.captcha.$error) { this.errorMsg = '请输入 4 位图片验证码' }
            else if (this.$v.auth.msgCode.$error) { this.errorMsg = '请输入 6 位短信或邮箱验证码' }
            else if (this.$v.auth.nickname.$error) { this.errorMsg = '请输入用户昵称' }
            else if (this.$v.auth.password.$error) { this.errorMsg = '请输入密码' }
            else if (this.$v.auth.repeatPassword.$error) { this.errorMsg = '请再次输入密码' }
            this.$v.$touch();

            if (this.auth.type == 'personal') {
                this.loading = false;
                return;
            }
        }

        // 企业开发者 - 判断表单是否无效
        if (this.auth.type == 'enterprise' && this.$v.authCompany.$invalid) {
            // 根据表单错误项输出提示内容
            if (this.$v.authCompany.company.$error) this.errorMsg = '请输入完整企业名称，例如：北京市XXX科技有限公司'
            else if (this.$v.authCompany.businessLicense.$error) this.errorMsg = '请输入营业执照统一社会信用代码，并上传营业执照图片'
            this.$v.$touch();
            this.loading = false;
            return;
        }

        // 判断两次输入的密码是否一致
        if (this.auth.password !== this.auth.repeatPassword) {
            this.errorMsg = '两次输入的密码不一致，请重新输入';
            this.loading = false;
            return;
        }

        // 判断密码复杂性是否符合要求
        const pwdRegex = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z]).{6,20}');
        if (!pwdRegex.test(this.auth.password) || !pwdRegex.test(this.auth.repeatPassword)) {
            this.errorMsg = '密码不符合要求，要求由 6-20 个英文字母和数字组合';
            this.loading = false;
            return;
        }

        // 输入格式验证成功
        this.errorMsg = false;

        // 调用 API 进行登录验证
        this.submitAPI();
    },
    /*
     *  用户注册方法
     *  注册成功后跳转页面
     */
    submitAPI() {
        let url = '';

        // 生成 POST API 参数
        const params = {
            nickname: this.auth.nickname,
            password: this.auth.password,
            confirmPassword: this.auth.repeatPassword,
            // seqNo: this.msgCodeToken,
            captchaToken: this.captchaToken,
            verifyCode: this.auth.msgCode,
            isEnterpriseDeveloper: this.auth.type == 'personal' ? false : true,
        };

        // 企业用户需要扩展字段
        if (this.auth.type == 'enterprise') {
            params.enterpriseName = this.authCompany.company;
            params.enterpriseCreditCode = this.authCompany.businessLicense;
            params.enterpriseBusinessLicense = {items: this.authCompany.businessLicenseFiles};
        }

        // 判断注册账号是手机或邮箱
        if (this.auth.name.indexOf('@') !== -1) {
            url = this.__API__.register.registerByEmailCode();
            params.email = this.auth.name;
        } else if (this.auth.name.length === 11 && /^1[3456789]\d{9}$/.test(this.auth.name)) {
            url = this.__API__.register.registerByPhoneCode();
            params.phone = this.auth.name;
        }

        // 调用注册 API，注册成功后跳转到登录页面
        api.postJsonApi(url, params)
            .then((response) => {
                if (response.data.code !== 200) {
                    this.$bvToast.toast(response.data.msg, {
                        title: '注册失败', variant: 'danger', toaster: 'b-toaster-bottom-right'
                    });
                    this.loading = false;
                    return;
                }
                this.loading = false;
                this.$router.push({ name: 'register_success', query: this.$route.query });
            }).catch((error) => {
                this.$bvToast.toast(error, {
                    title: '注册异常', variant: 'danger', toaster: 'b-toaster-bottom-right'
                });
                this.loading = false;
            })
    },
    /*
     *  获取验证码图片
     */
    getCaptcha() {
        this.captchaLoading = true;
        this.captchaToken = uuidv1();
        this.captcha = this.__API__.captcha.getImage(this.captchaToken);
        this.__SLEEP__(100).then(() => {
            this.captchaLoading = false;
        })
    },
    /*
     *  获取手机号或邮箱验证码方法
     */
    getMsgCode() {
        // 检查: 发送手机、邮箱验证码前三步检查
        // 1.1 判断手机号或邮箱是否已输入
        if (!this.auth.name || !this.auth.captcha) {
            this.$bvToast.toast(
                '请输入手机号或邮箱以及图片中验证码后，再点击发送验证码',
                {title: '提示', variant: 'danger', toaster: 'b-toaster-bottom-right'}
            );
            return;
        }

        // 1.2 判断手机号或邮箱是否符合规范
        if (!this.isPhone(this.auth.name) && !this.isEmail(this.auth.name)) {
            this.$bvToast.toast(
                '输入的手机号或邮箱格式有误，请重新输入',
                {title: '提示', variant: 'danger', toaster: 'b-toaster-bottom-right'}
            );
            return;
        }

        // 1.3 判断图片验证码是否为 4 位
        if (this.auth.captcha.length !== 4) {
            this.$bvToast.toast(
                '输入的图片验证码格式有误，请检查',
                {title: '提示', variant: 'danger', toaster: 'b-toaster-bottom-right'}
            );
            return;
        }
        // 检查 End

        // 2. 根据用户输入的信息，判断出手机号或邮箱，生成发送验证码 API 数据结构
        let apiURL = '';
        const params = { captchaToken: this.token, imageCode: this.auth.captcha };

        if (this.auth.name.indexOf('@') !== -1) {
            apiURL = this.__API__.register.getEmailCode();
            params.checkCodeType = 3;   // 0:手机号注册,1:手机号绑定,2:手机号密码重置,3:邮箱注册,4:邮箱绑定,5:邮箱密码重置
            params.email = this.auth.name;
        } else if (this.auth.name.length === 11 && /^1[3456789]\d{9}$/.test(this.auth.name)) {
            apiURL = this.__API__.register.getPhoneCode();
            params.checkCodeType = 0;   // 0:手机号注册,1:手机号绑定,2:手机号密码重置,3:邮箱注册,4:邮箱绑定,5:邮箱密码重置
            params.phone = this.auth.name;
        }

        // 3. 调用 API 发送验证码
        api.postJsonApi(apiURL, params)
            .then((response) => {
                if (response.data.code !== 200) {
                    // 修改图片验证码的 Token 让其失效
                    this.captchaToken = uuidv1();
                    this.loading = false;
                    return;
                }

                this.msgCodeDisplay = false;

                const timer = setInterval(() => {
                    this.msgCodeTimer--;
                    if (this.msgCodeTimer === 0) {
                        this.msgCodeTimer = this.msgCodeTime;
                        this.msgCodeDisplay = true;
                        timer && clearInterval(timer);
                    }
                }, 1000)

                this.$once('hook:beforeDestroy', function() {
                    timer && clearInterval(timer);
                })
                this.loading = false;
            })
            .catch((error) => {
                this.$bvToast.toast(error, {
                    title: '验证码发送失败', variant: 'danger', toaster: 'b-toaster-bottom-right'
                });
                this.loading = false;
            });
    },
    /*
     *  上传营业执照动作
     */
    businessLicenseUpload(e) {
        const files = e.target.files;
        this.authCompany.businessLicenseFiles = [];
        this.authCompany.businessLicenseFileNames = [];
        for (const file of files) {
            this.businessLicenseImageToBase64(file);
        }
    },
    /*
     *  将营业执照图片转换为 Base64 格式
     */
    businessLicenseImageToBase64(file) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            this.authCompany.businessLicenseFiles.push(reader.result);
            this.authCompany.businessLicenseFileNames.push(file.name);
        }
        reader.onerror = function(error) {
            this.$bvToast.toast(error, {
                title: '转换图片格式有误', variant: 'danger', toaster: 'b-toaster-bottom-right'
            });
        }
    }
};

export default {
    data,
    methods,
    created() {
        this.getCaptcha();
    },
    mounted() {
        this.$nextTick(() => {
            this.$refs.autofocus.focus()
        }
    )},
    // form 表单验证
    validations: {
        auth: {
            name: { required },
            captcha: { required, minLength: minLength(4), maxLength: maxLength(4) },
            msgCode: { required, minLength: minLength(6), maxLength: maxLength(6) },
            nickname: { required, minLength: minLength(2), maxLength: maxLength(16) },
            password: { required, minLength: minLength(6), maxLength: maxLength(20) },
            repeatPassword: { required, minLength: minLength(6), maxLength: maxLength(20) },
        },
        authCompany: {
            company: { required, minLength: minLength(4), maxLength: maxLength(30) },
            businessLicense: { required, minLength: minLength(18), maxLength: maxLength(18) },
            businessLicenseFiles: { required },
        },
    },
};
