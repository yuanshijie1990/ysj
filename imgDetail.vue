<template>
  <div class="img-detail">
    <el-radio-group v-if="!alyql" v-model="chuzhi" size="small" class="deal-btns" @change="chuzhiHandle">
      <el-radio-button label="处置前"></el-radio-button>
      <el-radio-button label="处置后"></el-radio-button>
    </el-radio-group>
    <el-carousel v-if="imgs.length>0" :autoplay="false" class="car-detail">
      <el-carousel-item ref="view" v-for="item in imgs" :key="item" class="car-detail-item">
        <img class="img-detail" :src="item" @click="viewImg"/>
      </el-carousel-item>
    </el-carousel>
    <div v-else style="height: 280px; display:flex; align-items:center; justify-content:center"><div>暂无图片</div></div>
    <div style="display:none">
      <ul ref="swiperContainer">
        <li v-for="img in imgs" :key="img">
          <img style="width:100%" :src="img" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import 'viewerjs/dist/viewer.css';
import Viewer from 'viewerjs';
export default {
  props: {
    before: {
      type: Array,
      default: ()=>[]
    },
    after: {
      type: Array,
      default: ()=>[]
    },
    alyql: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      imgUrl: '',
      chuzhi: "处置前",
      imgs: [],
      gallery: null
    };
  },
  watch:{
    before: {
      handler(n) {
        this.chuzhiHandle(this.chuzhi)
      },
      immediate: true,
      deep:true
    },
    after: {
      handler(n) {
        this.chuzhiHandle(this.chuzhi)
      },
      immediate: true,
      deep:true
    }
  },
  methods: {
    chuzhiHandle(n) {
      if(this.alyql){
        this.imgs = this.before
      }else if(n==="处置前"){
        this.imgs = this.before
      }else{
        this.imgs = this.after
      }
    },
    viewImg() {
      let _this = this
      this.gallery = new Viewer(this.$refs.swiperContainer, {hidden(){
        _this.gallery.destroy()
        _this.gallery = null
      }});
      this.gallery.show()
      this.$nextTick(()=>{
        let ele = document.getElementsByClassName('viewer-container')[0]
        ele.setAttribute('style', 'z-index:9999')
      })
    }
  }
};
</script>

<style lang="scss" scoped>
.img-detail{
  position: relative;
  .deal-btns{
    position: absolute;
    top: 32px;
    left: 12px;
    z-index: 5;
  }
  .car-detail-item{
    margin-top: 20px;
    height: 280px;
    .img-detail{
      width: 100%;
      height: 100%;
    }
  }
}
</style>
