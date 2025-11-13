/** @jsxImportSource @emotion/react */
import ShopPopup, { type CostumeDetailProps, type ItemDetailProps } from './shop-popup';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { deleteCostume, putCostume, selectCostumes } from '@api/costume-api';
import { selectItems } from '@api/item-api';
import { useSound } from '@context/sound-context';
import { useToken } from '@context/user-context';
import type { ImagesProps } from '@pages/home';
import {
  shopBoxCss,
  shopCloseButtonCss,
  shopGridCss,
  shopItemButtonCss,
  shopItemCountCss,
  shopItemUseButtonCss,
  shopOptionCss,
  shopOverlayCss,
  shopReadyCss,
  shopResourceCss,
  shopSelectCss,
  shopTabCss,
  shopWrapperCss,
} from '@styles/components/shop.css';
import { getBGMs } from '@utils/get-sounds';

interface ShopProps {
  handleShop: () => void;
  images: ImagesProps;
  equipment: [];
  refreshMember: () => Promise<void>;
}

export interface ItemProps {
  item: ItemDetailProps;
  quantity: number;
}

export interface CostumeProps {
  costume: CostumeDetailProps;
  owned: boolean;
}

const Shop = ({ handleShop, images, equipment, refreshMember }: ShopProps) => {
  const [items, setItems] = useState<ItemProps[]>([]);
  const [costumes, setCostumes] = useState<CostumeProps[]>([]);
  const [select, setSelect] = useState([1, 2]);
  const [itemPopup, setItemPopup] = useState(-1);
  const [costumePopup, setCostumePopup] = useState(-1);
  const [overlay, setOverlay] = useState(false);
  const { token } = useToken();
  const { effect } = useSound();

  const subButtonSound = new Audio(getBGMs('button_sub'));

  useEffect(() => {
    const getItemsData = async () => {
      try {
        const response = await selectItems(token);
        setItems(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    const getCostumeData = async () => {
      try {
        const response = await selectCostumes(token);
        setCostumes(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    getItemsData();
    getCostumeData();
  }, []);

  const equipCostume = async (type: string, name: string, costumeId: number) => {
    try {
      const response = await putCostume(token, type, costumeId);
      refreshMember();
      toast.success(`${name} 장착 완료 🍌`);
    } catch (error) {
      toast.error(`${name} 장착 실패`);
      console.log(error);
    }
  };

  const unequipCostume = async (type: string, name: string) => {
    try {
      const response = await deleteCostume(token, type);
      refreshMember();
      toast.success(`${name} 장착 해제 🍌`);
    } catch (error) {
      toast.error(`${name} 장착 해제 실패`);
      console.log(error);
    }
  };

  const onClickItem = () => {
    if (effect) {
      subButtonSound.currentTime = 0;
      subButtonSound.play();
    }
    setSelect([1, 2]);
  };

  const onClickCostume = () => {
    if (effect) {
      subButtonSound.currentTime = 0;
      subButtonSound.play();
    }
    setSelect([2, 1]);
  };

  const handleItem = (index: number) => {
    if (effect) {
      subButtonSound.currentTime = 0;
      subButtonSound.play();
    }
    setItemPopup(index);
    setOverlay(!overlay);
  };

  const handleCostume = (index: number) => {
    if (effect) {
      subButtonSound.currentTime = 0;
      subButtonSound.play();
    }
    setCostumePopup(index);
    setOverlay(!overlay);
  };

  return (
    <>
      {itemPopup !== -1 && (
        <ShopPopup
          handlePopup={handleItem}
          images={images}
          data={items[itemPopup].item as ItemDetailProps}
          refreshMember={refreshMember}
        />
      )}
      {costumePopup !== -1 && (
        <ShopPopup
          handlePopup={handleCostume}
          images={images}
          data={costumes[costumePopup].costume as CostumeDetailProps}
          refreshMember={refreshMember}
        />
      )}
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
              {Array.from({ length: 4 }).map((_, index) => {
                const data = items[index];
                if (data) {
                  return (
                    <li key={index} css={shopBoxCss(images)}>
                      <span css={shopItemCountCss}>{data.quantity > 0 && data.quantity}</span>
                      <img
                        src={images[data.item.code as keyof ImagesProps]}
                        alt={data.item.code}
                        css={shopResourceCss}
                      />
                      <div css={shopItemButtonCss(images)} onClick={() => handleItem(index)}>
                        <img src={images.shop_coin} alt="동전_이미지" width={24} />
                        {data.item.cost}
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={index} css={[shopBoxCss(images), shopReadyCss]}>
                    준비중
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul css={shopGridCss}>
              {Array.from({ length: 4 }).map((_, index) => {
                const data = costumes[index];
                if (data) {
                  return (
                    <li key={index} css={shopBoxCss(images)}>
                      <img
                        src={images[data.costume.code as keyof ImagesProps]}
                        alt={data.costume.code}
                        css={shopResourceCss}
                      />
                      {data.owned ? (
                        equipment.some((eq: { id: number }) => eq.id === data.costume.id) ? (
                          <img
                            src={images.shop_notuse}
                            alt="코스튬_해제하기_버튼"
                            width={76}
                            css={shopItemUseButtonCss}
                            onClick={() => unequipCostume(data.costume.type, data.costume.name)}
                          />
                        ) : (
                          <img
                            src={images.shop_use}
                            alt="코스튬_장착하기_버튼"
                            width={76}
                            css={shopItemUseButtonCss}
                            onClick={() => equipCostume(data.costume.type, data.costume.name, data.costume.id)}
                          />
                        )
                      ) : (
                        <div css={shopItemButtonCss(images)} onClick={() => handleCostume(index)}>
                          <img src={images.shop_coin} alt="동전_이미지" width={24} />
                          {data.costume.cost}
                        </div>
                      )}
                    </li>
                  );
                }
                return (
                  <li key={index} css={[shopBoxCss(images), shopReadyCss]}>
                    준비중
                  </li>
                );
              })}
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
