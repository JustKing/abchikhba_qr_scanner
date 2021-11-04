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
  Separator
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import React from 'react';
import bridge from '@vkontakte/vk-bridge';

const App = withPlatform(
  withAdaptivity(
    class App extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          activePanel: 'home',
          qrCodes: []
        };
      }

      componentDidMount() {
        bridge.send('VKWebAppStorageGet', { keys: ['qrCodes'] }).then((data) => {
          if (data?.keys) {
            this.setState({ qrCodes: JSON.parse(data.keys[0].value) });
          }
        });
      }

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

      setUrl(url) {
        try {
          url = new URL(url);
          const qrCodes = [...this.state.qrCodes];
          qrCodes.push({
            label: url.hostname,
            link: url.origin,
            path: url.pathname,
            params: url.search.slice(1).split('&'),
            hash: url.hash
          });
          this.setState({ qrCodes });
          bridge.send('VKWebAppStorageSet', { key: 'qrCodes', value: JSON.stringify(this.state.qrCodes) });
        } catch (e) {
          console.log(url);
        }
      }

      removeQrCode(id) {
        this.setState({
          qrCodes: this.state.qrCodes.filter((code, index) => index !== id)
        });
        bridge.send('VKWebAppStorageSet', { key: 'qrCodes', value: JSON.stringify(this.state.qrCodes) });
      }

      render() {
        const isMobile = this.props.viewWidth <= ViewWidth.MOBILE;

        return (
          <AppRoot>
            <SplitLayout header={<PanelHeader separator={false} />}>
              <SplitCol spaced={!isMobile}>
                <View activePanel={this.state.activePanel}>
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
                    <Group header={<Header mode="secondary">Отсканированные qr-коды</Header>}>
                      {this.state.qrCodes.length > 0 ? (
                        this.state.qrCodes.map((code, index) => {
                          return (
                            <Div>
                              <RichCell
                                multiline
                                text={`Путь: ${code.path}`}
                                caption={`Параметры: ${code.params.join(', ')}`}
                                after={code.hash}
                                actions={
                                  <Div style={{ display: 'flex' }}>
                                    <Button stretched mode="primary" onClick={() => window.open(code.link)}>
                                      Перейти
                                    </Button>
                                    <Button stretched mode="destructive" onClick={() => this.removeQrCode(index)}>
                                      Удалить
                                    </Button>
                                  </Div>
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
