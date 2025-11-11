/** @jsxImportSource @emotion/react */
import type { ImagesProps } from '@pages/home';
import {
  shopItemBoxCss,
  shopItemBoxResourceCss,
  shopItemButtonsCss,
  shopItemCountCss,
  shopItemDetailCss,
  shopItemExplainCss,
  shopItemLayoutCss,
  shopItemPriceCss,
  shopItemPriceNumberCss,
  shopItemTitleCss,
  shopPopuopWrapperCss,
  shopPopupButtonCss,
  shopPopupTabCss,
} from '@styles/components/shop-popup.css';

interface ShopPopupProps {
  handlePopup: (index: number) => void;
  images: ImagesProps;
}

// 아이템인지, 코스튬인지 판별 필요
const ShopPopup = ({ handlePopup, images }: ShopPopupProps) => {
  return (
    <>
      <div css={shopPopuopWrapperCss}>
        <div css={shopItemDetailCss}>
          <div css={shopItemTitleCss}>아이템 이름</div>
          <div css={shopItemLayoutCss}>
            <div css={shopItemBoxCss(images)}>
              <img src={images['ITEM-001']} alt="아이템_상세_이미지" css={shopItemBoxResourceCss} />
            </div>
            <div>
              <div css={shopItemPriceCss}>
                <img src={images.shop_coin} alt="동전_이미지" width={24} />
                <span css={shopItemPriceNumberCss}>500</span>
              </div>
              <div css={shopItemExplainCss}>로켓을 타고 날아올라 더 높은 곳에서 시작해요.</div>
              <div css={shopItemCountCss}>
                <img src={images.shop_minus} alt="아이템_개수_감소" width={18} />
                <span>0</span>
                <img src={images.shop_plus} alt="아이템_개수_증가" width={18} />
              </div>
            </div>
          </div>
          <div css={shopItemButtonsCss}>
            <img
              src={images.shop_notbuy}
              alt="아이템_구매하지_않기"
              css={shopPopupButtonCss}
              onClick={() => handlePopup(-1)}
            />
            <img src={images.shop_buy} alt="아이템_구매하기" css={shopPopupButtonCss} />
          </div>
        </div>
        <img src={images.shop_container} alt="상점_상세_탭" css={shopPopupTabCss} />
      </div>
    </>
  );
};

export default ShopPopup;
