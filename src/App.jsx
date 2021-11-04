import { Icon28QrCodeOutline } from '@vkontakte/icons';
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
          currentQrIndex: 0
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
          const qrCodes = [...this.state.qrCodes];
          qrCodes.push({
            label: url.hostname,
            link: url.href,
            path: url.pathname,
            params: url.search.slice(1).split('&'),
            hash: url.hash
          });
          this.setState({ qrCodes });
          bridge.send('VKWebAppStorageSet', { key: 'qrCodes', value: JSON.stringify(this.state.qrCodes) });
        } catch (e) {
          this.setState({
            activeModal: 'warning'
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
            <WarningModal id="warning" onClose={this.closeModal} />
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
