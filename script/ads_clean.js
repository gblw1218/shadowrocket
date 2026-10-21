/**
 * Shadowrocket 动态广告 API 数据清洗脚本
 * 功能：解析 JSON 响应并剔除广告/推荐数据
 */

const url = $request.url;
let body = $response.body;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 1. 高德地图开屏/推荐/卡片广告接口处理
        if (url.includes('amap.com')) {
            if (obj.data) {
                // 清空开屏广告、卡片推荐与广告位
                delete obj.data.splash_screen;
                delete obj.data.ad_list;
                delete obj.data.recommend_cards;
                if (Array.isArray(obj.data.cards)) {
                    obj.data.cards = obj.data.cards.filter(card => !card.card_type?.includes('ad'));
                }
            }
        }

        // 2. 酷狗音乐 / 网易云音乐 开屏与广告配置接口
        else if (url.includes('kugou.com') || url.includes('music.163.com')) {
            if (obj.data) {
                delete obj.data.ads;
                delete obj.data.splash;
                if (Array.isArray(obj.data)) {
                    obj.data = obj.data.filter(item => !item.is_ad);
                }
            }
            if (obj.ads) delete obj.ads;
        }

        // 3. 微信小程序/公众号广告接口处理
        else if (url.includes('weixin.qq.com')) {
            if (obj.advertisement_num) obj.advertisement_num = 0;
            if (obj.advertisement_info) obj.advertisement_info = [];
            if (obj.ad_info) delete obj.ad_info;
        }// 4. 菜鸟裹裹开屏/首页/轮播广告接口清洗
        else if (url.includes('cainiao.com')) {
            if (obj.data) {
                // 清空开屏广告、网流广告及推荐横幅
                delete obj.data.ads;
                delete obj.data.splash;
                delete obj.data.slide;
                delete obj.data.banner;
                if (Array.isArray(obj.data.advertisings)) {
                    obj.data.advertisings = [];
                }
                if (Array.isArray(obj.data.list)) {
                    obj.data.list = obj.data.list.filter(item => !item.type?.includes('ad') && !item.isAd);
                }
            }
        }

        // 写入注入标记（用于自测校验）
        obj._sr_clean_test = {
            timestamp: Date.now(),
            status: "SUCCESS_CLEANED"
        };

        body = JSON.stringify(obj);
    } catch (e) {
        // 若非 JSON 或解析报错，不中断正常网络流量
        console.log("ads_clean.js JSON parse error: " + e);
    }
}

$done({ body });