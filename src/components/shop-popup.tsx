/** @jsxImportSource @emotion/react */
import toast from 'react-hot-toast';
import { createCostume } from '@api/costume-api';
import { createItem } from '@api/item-api';
import type { ImagesProps } from '@pages/home';
import {
  shopItemBoxCss,
  shopItemBoxResourceCss,
  shopItemButtonsCss,
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
  data: ItemDetailProps | CostumeDetailProps;
  refreshMember: () => Promise<void>;
}

export interface ItemDetailProps {
  id: number;
  name: string;
  code: string;
  cost: number;
  desc: string;
}

export interface CostumeDetailProps {
  id: number;
  name: string;
  type: string;
  code: string;
  cost: number;
  desc: string;
}

const isItemDetail = (data: ItemDetailProps | CostumeDetailProps): data is ItemDetailProps => {
  return (
    (data as ItemDetailProps).id !== undefined &&
    (data as ItemDetailProps).code !== undefined &&
    (data as ItemDetailProps).desc !== undefined &&
    !(data as CostumeDetailProps).type
  );
};

const ShopPopup = ({ handlePopup, images, data, refreshMember }: ShopPopupProps) => {
  const buyItem = async (itemId: number) => {
    try {
      const response = await createItem(itemId);
      refreshMember();
      toast.success(`${data.name} 구매 완료 🍌`);
    } catch (error) {
      toast.error(`${data.name} 구매 실패`);
      console.log(error);
    }
  };

  const buyCostume = async (costumeId: number) => {
    try {
      const response = await createCostume(costumeId);
      refreshMember();
      toast.success(`${data.name} 구매 완료 🍌`);
      handlePopup(-1);
    } catch (error) {
      toast.error(`${data.name} 구매 실패.`);
      console.log(error);
    }
  };

  return (
    <>
      <div css={shopPopuopWrapperCss}>
        <div css={shopItemDetailCss}>
          <div css={shopItemTitleCss}>{data.name}</div>
          <div css={shopItemLayoutCss}>
            <div css={shopItemBoxCss(images)}>
              <img src={images[data.code as keyof ImagesProps]} alt={data.code} css={shopItemBoxResourceCss} />
            </div>
            <div>
              <div css={shopItemPriceCss}>
                <img src={images.shop_coin} alt="동전_이미지" width={24} />
                <span css={shopItemPriceNumberCss}>{data.cost}</span>
              </div>
              <div css={shopItemExplainCss}>{data.desc}</div>
              {/* <div css={shopItemCountCss}>
                <img src={images.shop_minus} alt="아이템_개수_감소" width={18} />
                <span>0</span>
                <img src={images.shop_plus} alt="아이템_개수_증가" width={18} />
              </div> */}
            </div>
          </div>
          <div css={shopItemButtonsCss}>
            <img
              src={images.shop_notbuy}
              alt="아이템_구매하지_않기"
              css={shopPopupButtonCss}
              onClick={() => handlePopup(-1)}
            />
            <img
              src={images.shop_buy}
              alt="코스튬_구매하기"
              css={shopPopupButtonCss}
              onClick={
                isItemDetail(data)
                  ? () => buyItem((data as ItemDetailProps).id)
                  : () => buyCostume((data as CostumeDetailProps).id)
              }
            />
          </div>
        </div>
        <img src={images.shop_container} alt="상점_상세_탭" css={shopPopupTabCss} />
      </div>
    </>
  );
};

export default ShopPopup;
