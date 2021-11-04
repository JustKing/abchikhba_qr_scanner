import { ModalCard } from '@vkontakte/vkui';

export const CountModal = ({ onClose, ...props }) => {
  return <ModalCard id={props.id} onClose={onClose} header="Количество сохраненных кодов" subheader={props.count} />;
};
