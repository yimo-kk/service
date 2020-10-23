<template>
<div class="login">
    <div v-if="loading" class="spin">
        <a-spin class="loading"></a-spin>
    </div>
    <a-card style="width: 400px;textAlign: center;paddingTop:20px">
        <a-form :form="loginParam" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }" @submit="handleSubmit">
            <a-form-item label="商家标识" >
                <a-input placeholder="请输入商家标识" v-decorator="['shopCode', { initialValue: loginData.shopCode },{ rules: [  
                { required: true, message: '请填写商家标识!' },{
                validator: validateShopCode,
              }
              ] 
              }]" allowClear autoComplete="on">
                    <a-icon slot="prefix" type="shop" />
                </a-input>
            </a-form-item>
            <a-form-item label="账号">
                <a-input placeholder="请输入账号" v-decorator="['account',{ initialValue: loginData.account }, { rules: [{ required: true, message: '请填写客服账号!' }] }]" allowClear autoComplete="on">
                    <a-icon slot="prefix" type="user" />
                </a-input>
            </a-form-item>
            <a-form-item label="密码">
                <a-input-password placeholder="请输入密码" v-decorator="['password',{ initialValue: loginData.password }, { rules: [{ required: true, message: '请填写密码!' }] }]" allowClear>
                    <a-icon slot="prefix" type="lock" />
                </a-input-password>
            </a-form-item>
            <a-form-item :wrapper-col="{ span: 17, offset: 4 }">
                <a-button type="primary" html-type="submit" style="width:100%">登录</a-button>
                <a-checkbox
                    v-decorator="[
                    'remember',
                    {
                        valuePropName: 'checked',
                        initialValue: true,
                    },
                    ]"
                >
                    <p class="remember_password">记住账号/密码</p>
                </a-checkbox>
              
                <!-- <a-button type="primary" @click="winSize">修改窗口大小</a-button> -->
            </a-form-item>
        </a-form>
    </a-card>
</div>
</template>

<script>
import { BrowserWindow,remote} from "electron";
import { mapActions } from "vuex";
export default {
    name: "Login",
    components: {},
    data() {
        return {
            ip:'',
            loading: false,
            loginParam: this.$form.createForm(this, {
                name: "login",
            }),
            loginData:{
                shopCode:'',
                account:'',
                password:''
            }
        };
    },
    computed: {},
    watch: {},
    methods: {
        ...mapActions(["handleLogin", "getUserInfo"]),
        handleSubmit(e) {
            e.preventDefault();
            this.loginParam.validateFields((err, values) => {
                if (!err) {
                    let params = {
                        username: values.account,
                        password: values.password,
                        seller_code: values.shopCode,
                        // username: "zhoushigang",
                        // password: "123456",
                        // seller_code: "5f0992f981e27",
                        
                    };
                 
                    if(values.remember){
                        localStorage.setItem('loginData',JSON.stringify(params))
                    }else {
                       localStorage.removeItem('loginData') 
                    }
                    this.loading = true;
                    params.login_ip=this.ip
                    this.handleLogin(params).then((result) => {
                        if (result.code === 0) {
                            localStorage.setItem("accessToken", result.data.accessToken);
                            localStorage.setItem("refreshToken", result.data.refreshToken);
                            this.$message.success(result.msg);
                            this.getUserInfo().then((res) => {
                                this.loading = false;
                                res.code === 0 &&
                                    this.$router.push({
                                        name: "Home",
                                    }); 
                            });
                        } else {
                            this.$toast({
                                content: result.msg,
                            });
                        }
                    }).catch(error=>{
                        this.loading = false;
                    })
                }
            });
        },
        // 校验商家标识
        validateShopCode(rule, value, callback) {
            var reg=/[^\w\.\/]/;
            if(value && reg.test(value)){
                callback('请输入正确的商家标识码！');
            } else {
                callback();
            }
        },
        },
    created() {
    },
    mounted() {
        this.ip = returnCitySN["cip"]; // ip
        this.$store.commit('SET_USER_IP',{ip:this.ip})
        let data = localStorage.getItem('loginData')
        if(data){
            let {username,password,seller_code} = JSON.parse(data)
            this.loginData = {
                account:username,
                password,
                shopCode:seller_code
            }
        }
    },
};
</script>

<style lang="less" scoped>
.login {
    width: 100%;
    height: 100vh;
    background: url("https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=3296579017,1843088940&fm=26&gp=0.jpg") no-repeat;
    background-size: cover;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

.spin {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    position: absolute;
    left: 0;
    top: 0;
    z-index: 333;

    .loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 555;
    }
}
.remember_password{
    font-size: 10px;
    color: #ccc;
}

/deep/.ant-input {
    font-size: 12px;
    border: 1px solid #d9d9d9;
}

/deep/.ant-form-item-control {
    text-align: left;
}

/deep/.ant-form-explain {
    font-size: 12px;
}
/deep/ .ant-checkbox-wrapper{
        display: flex;
    align-items: center;
}
</style>
