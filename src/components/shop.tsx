/** @jsxImportSource @emotion/react */
import ShopPopup from './shop-popup';
import { useState } from 'react';
import type { ImagesProps } from '@pages/home';
import {
  shopBoxCss,
  shopCloseButtonCss,
  shopGridCss,
  shopItemButtonCss,
  shopOptionCss,
  shopOverlayCss,
  shopReadyCss,
  shopResourceCss,
  shopSelectCss,
  shopTabCss,
  shopWrapperCss,
} from '@styles/components/shop.css';

interface ShopProps {
  handleShop: () => void;
  images: ImagesProps;
}

const Shop = ({ handleShop, images }: ShopProps) => {
  const [select, setSelect] = useState([1, 2]);
  const [itemPopup, setItemPopup] = useState(-1);
  const [costumePopup, setCostumePopup] = useState(-1);
  const [overlay, setOverlay] = useState(false);

  const onClickItem = () => {
    setSelect([1, 2]);
  };

  const onClickCostume = () => {
    setSelect([2, 1]);
  };

  const handleItem = (index: number) => {
    setItemPopup(index);
    setOverlay(!overlay);
  };

  const handleCostume = (index: number) => {
    setCostumePopup(index);
    setOverlay(!overlay);
  };

  return (
    <>
      {itemPopup !== -1 && <ShopPopup handlePopup={handleItem} images={images} />}
      {costumePopup !== -1 && <ShopPopup handlePopup={handleCostume} images={images} />}
      <div css={shopWrapperCss}>
        <div css={shopSelectCss}>
          <div css={shopOptionCss(select[0], images)} onClick={onClickItem}>
            아이템
          </div>
          <div css={shopOptionCss(select[1], images)} onClick={onClickCostume}>
            코스튬
          </div>
        </div>
        <div>
          {select[0] === 1 ? (
            <ul css={shopGridCss}>
              {Array.from({ length: 4 }).map((_, index) =>
                index === 0 ? (
                  <li key={index} css={shopBoxCss(images)} onClick={() => handleItem(index)}>
                    <img src={images['ITEM-001']} alt="상점_아이템_001" css={shopResourceCss} />
                    <div css={shopItemButtonCss(images)}>
                      <img src={images.shop_coin} alt="동전_이미지" width={24} />
                      500
                    </div>
                  </li>
                ) : index === 1 ? (
                  <li key={index} css={shopBoxCss(images)} onClick={() => handleItem(index)}>
                    <img src={images['ITEM-002']} alt="상점_아이템_002" css={shopResourceCss} />
                    <div css={shopItemButtonCss(images)}>
                      <img src={images.shop_coin} alt="동전_이미지" width={24} />
                      500
                    </div>
                  </li>
                ) : (
                  <li key={index} css={[shopBoxCss(images), shopReadyCss]}>
                    준비중
                  </li>
                ),
              )}
            </ul>
          ) : (
            <ul css={shopGridCss}>
              {Array.from({ length: 4 }).map((_, index) =>
                index === 0 ? (
                  <li key={index} css={shopBoxCss(images)} onClick={() => handleCostume(index)}>
                    <img src={images['SCARF-001']} alt="상점_코스튬_001" css={shopResourceCss} />
                    <div css={shopItemButtonCss(images)}>
                      <img src={images.shop_coin} alt="동전_이미지" width={24} />
                      500
                    </div>
                  </li>
                ) : (
                  <li key={index} css={[shopBoxCss(images), shopReadyCss]}>
                    준비중
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
        <img src={images.shop_frame} alt="상점_탭" css={shopTabCss} />
        <img src={images.close} alt="상점_닫기" css={shopCloseButtonCss} onClick={handleShop} />
      </div>
      <div css={shopOverlayCss(overlay)} />
    </>
  );
};

export default Shop;
