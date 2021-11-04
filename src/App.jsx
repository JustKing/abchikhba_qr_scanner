import { Icon28QrCodeOutline, Icon24StickerOutline } from '@vkontakte/icons';
import {
  AppRoot,
  SplitLayout,
  SplitCol,
  ViewWidth,
  View,
  Panel,
  PanelHeader,
  Header,
  Group,
  RichCell,
  PanelHeaderButton,
  Button,
  PanelHeaderContent,
  Div,
  withAdaptivity,
  withPlatform,
  Separator,
  ModalRoot
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import { ApproveModal } from './components/ApproveModal';
import { CountModal } from './components/CountModal';
import { WarningModal } from './components/WarningModal';

const App = withPlatform(
  withAdaptivity(
    class App extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          activePanel: 'home',
          qrCodes: [],
          activeModal: null,
          currentQrIndex: 0,
          warningMessage: '',
          stickers: [
            {
              sticker_type: 'renderable',
              sticker: {
                can_delete: 0,
                content_type: 'image',
                url: 'https://cdn.discordapp.com/attachments/282895727422603265/905864326781476864/Frame_1-3.png',
                clickable_zones: [
                  {
                    action_type: 'app',
                    action: {
                      app_id: 7992855
                    }
                  }
                ]
              }
            },
            {
              sticker_type: 'renderable',
              sticker: {
                can_delete: 0,
                content_type: 'image',
                url: 'https://cdn.discordapp.com/attachments/282895727422603265/905863142553288744/Frame_1-2.png',
                clickable_zones: [
                  {
                    action_type: 'app',
                    action: {
                      app_id: 7992855
                    }
                  }
                ]
              }
            }
          ]
        };

        this.closeModal = () => {
          this.setState({ activeModal: null });
        };
      }

      componentDidMount() {
        bridge.send('VKWebAppStorageGet', { keys: ['qrCodes'] }).then((data) => {
          if (data?.keys) {
            this.setState({ qrCodes: JSON.parse(data.keys[0].value) });
          }
        });
      }

      /**
       * @description Открыть сканер
       */
      openScanner() {
        bridge
          .send('VKWebAppOpenCodeReader')
          .then((data) => {
            if (data.code_data) {
              this.setUrl(data.code_data);
            }
          })
          .catch((error) => {
            console.error(error.error_type);
            console.error(error.error_data);
          });
      }

      /**
       * @description Разбор ссылки - если не ссылка, то покажи уведомление
       */
      setUrl(url) {
        try {
          url = new URL(url);
          if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error();
          }
          if (!['vk.com', 'm.vk.com'].includes(url.host)) {
            throw new Error();
          }
          const qrCodes = [...this.state.qrCodes];
          const newQrCode = {
            label: url.hostname,
            link: url.href,
            path: url.pathname,
            params: url.search.slice(1).split('&'),
            hash: url.hash
          };
          let hasCode = false;
          qrCodes.forEach((code) => {
            if (JSON.stringify(code) === JSON.stringify(newQrCode)) {
              hasCode = true;
            }
          });
          if (!hasCode) {
            qrCodes.push(newQrCode);
            this.setState({ qrCodes });
            bridge.send('VKWebAppStorageSet', { key: 'qrCodes', value: JSON.stringify(this.state.qrCodes) });
          } else {
            this.setState({
              activeModal: 'warning',
              warningMessage: 'Данная сcылка уже существует'
            });
          }
        } catch (e) {
          this.setState({
            activeModal: 'warning',
            warningMessage:
              'Попробуйте отсканировать валидную ссылку (Валидной считается ссылка ведущая на vk.com или m.vk.com с любыми путями и параметрами)'
          });
        }
      }

      /**
       * @description удалить сохраненный код
       */
      removeQrCode() {
        setTimeout(() => {
          this.setState({
            qrCodes: this.state.qrCodes.filter((code, index) => index !== this.state.currentQrIndex),
            currentQrIndex: 0
          });
          bridge.send('VKWebAppStorageSet', { key: 'qrCodes', value: JSON.stringify(this.state.qrCodes) });
        }, 500);
      }

      goTo(link) {
        window.open(link);
      }

      makeHistory() {
        bridge.send('VKWebAppShowStoryBox', {
          background_type: 'image',
          url: 'https://img3.akspic.ru/originals/6/2/1/3/5/153126-smartfon_micromax-cvetovoj_gradient-cvet-krasochnost-rozovyj-1080x1920.jpg',
          stickers: [this.state.stickers[Math.round(Math.random())]]
        });
      }

      render() {
        const isMobile = this.props.viewWidth <= ViewWidth.MOBILE;

        const modal = (
          <ModalRoot activeModal={this.state.activeModal}>
            <ApproveModal
              id="approve"
              link={this.state.qrCodes[this.state.currentQrIndex]}
              onClose={this.closeModal}
              removeQrCode={() => {
                this.closeModal();
                this.removeQrCode();
              }}
            />
            <CountModal id="count" count={this.state.qrCodes.length} onClose={this.closeModal} />
            <WarningModal id="warning" message={this.state.warningMessage} onClose={this.closeModal} />
          </ModalRoot>
        );

        return (
          <AppRoot>
            <SplitLayout header={<PanelHeader separator={false} />}>
              <SplitCol spaced={!isMobile}>
                <View activePanel={this.state.activePanel} modal={modal}>
                  <Panel id="home">
                    <PanelHeader
                      left={
                        <PanelHeaderButton>
                          <Icon28QrCodeOutline width={28} height={28} onClick={() => this.openScanner()} />
                          <Icon24StickerOutline width={28} height={28} onClick={() => this.makeHistory()} />
                        </PanelHeaderButton>
                      }
                    >
                      <PanelHeaderContent status="Абчихба">Qr-scanner</PanelHeaderContent>
                    </PanelHeader>
                    <Group
                      header={
                        <Header
                          mode="secondary"
                          aside={<Div onClick={() => this.setState({ activeModal: 'count' })}>Кол-во записей</Div>}
                        >
                          Отсканированные qr-коды
                        </Header>
                      }
                    >
                      {this.state.qrCodes.length > 0 ? (
                        this.state.qrCodes.map((code, index) => {
                          return (
                            <Div>
                              <RichCell
                                multiline
                                disabled
                                text={`Путь: ${code.path}`}
                                caption={`Параметры: ${code.params.join(', ')}`}
                                after={code.hash}
                                actions={
                                  <React.Fragment>
                                    <Button stretched mode="primary" onClick={() => this.goTo(code.link)}>
                                      Перейти
                                    </Button>
                                    <Button
                                      stretched
                                      mode="destructive"
                                      onClick={() => this.setState({ activeModal: 'approve', currentQrIndex: index })}
                                    >
                                      Удалить
                                    </Button>
                                  </React.Fragment>
                                }
                              >
                                Сайт: {code.label}
                              </RichCell>
                              <Separator style={{ margin: '12px 0' }} />
                            </Div>
                          );
                        })
                      ) : (
                        <Div>Сохранненых кодов нет</Div>
                      )}
                    </Group>
                  </Panel>
                </View>
              </SplitCol>
            </SplitLayout>
          </AppRoot>
        );
      }
    },
    {
      viewWidth: true
    }
  )
);

export default App;
