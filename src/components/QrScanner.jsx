import { Icon24Dismiss } from '@vkontakte/icons';
import {
  useAdaptivity,
  ViewWidth,
  usePlatform,
  ModalPage,
  ModalPageHeader,
  IOS,
  ANDROID,
  PanelHeaderButton,
  PanelHeaderClose,
  Group,
  Header
} from '@vkontakte/vkui';

export const QrScanner = ({ onClose, ...props }) => {
  const { viewWidth } = useAdaptivity();
  const isMobile = viewWidth <= ViewWidth.MOBILE;
  const platform = usePlatform();

  return (
    <ModalPage
      {...props}
      settlingHeight={100}
      header={
        <ModalPageHeader
          right={
            isMobile &&
            platform === IOS && (
              <PanelHeaderButton onClick={onClose}>
                <Icon24Dismiss />
              </PanelHeaderButton>
            )
          }
          left={isMobile && platform === ANDROID && <PanelHeaderClose onClick={onClose} />}
        >
          Наведите на qr-код
        </ModalPageHeader>
      }
    >
      <Group
        header={
          <Header mode="secondary" indicator="25">
            Друзья
          </Header>
        }
      >
        f
      </Group>
    </ModalPage>
  );
};
