import { ModalCard } from '@vkontakte/vkui';

export const WarningModal = ({ onClose, ...props }) => {
  return <ModalCard id={props.id} onClose={onClose} header="Попробуйте отсканировать валидную ссылку" />;
};
